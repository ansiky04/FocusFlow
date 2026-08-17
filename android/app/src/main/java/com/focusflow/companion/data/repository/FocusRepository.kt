package com.focusflow.companion.data.repository

import android.content.Context
import com.focusflow.companion.data.api.FocusFlowApiService
import com.focusflow.companion.data.model.*
import com.focusflow.companion.data.storage.AuthStorage
import com.focusflow.companion.utils.NotificationHelper
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.util.concurrent.TimeUnit

/**
 * FocusRepository — Manages authentication, session state machine, and notification triggers
 * between Render Backend API and Android UI / VpnService.
 */
class FocusRepository private constructor(context: Context) {

    private val authStorage = AuthStorage(context)
    private val notificationHelper = NotificationHelper(context)
    private var baseUrl = "https://focusflow-api-aazl.onrender.com/api/"

    private val loggingInterceptor = HttpLoggingInterceptor().apply {
        level = HttpLoggingInterceptor.Level.BODY
    }

    private val okHttpClient = OkHttpClient.Builder()
        .connectTimeout(15, TimeUnit.SECONDS)
        .readTimeout(15, TimeUnit.SECONDS)
        .addInterceptor(loggingInterceptor)
        .build()

    private val api: FocusFlowApiService = Retrofit.Builder()
        .baseUrl(baseUrl)
        .client(okHttpClient)
        .addConverterFactory(GsonConverterFactory.create())
        .build()
        .create(FocusFlowApiService::class.java)

    private val _shieldState = MutableStateFlow(MobileShieldState())
    val shieldState: StateFlow<MobileShieldState> = _shieldState.asStateFlow()

    private val _currentUser = MutableStateFlow<User?>(authStorage.getUser())
    val currentUser: StateFlow<User?> = _currentUser.asStateFlow()

    private var consecutiveNetworkErrors = 0

    fun isLoggedIn(): Boolean {
        return authStorage.isLoggedIn()
    }

    fun getToken(): String? {
        return authStorage.getToken()
    }

    fun updateShieldStatus(status: ShieldStateEnum, isShieldActive: Boolean = status == ShieldStateEnum.ACTIVE) {
        _shieldState.value = _shieldState.value.copy(
            shieldStatus = status,
            isShieldActive = isShieldActive
        )
    }

    suspend fun login(email: String, pass: String): Result<User> {
        return try {
            val response = api.login(AuthRequest(email = email, password = pass))
            if (response.isSuccessful && response.body()?.success == true) {
                val body = response.body()!!
                val token = body.token ?: throw Exception("Token missing from response")
                val user = body.user ?: throw Exception("User missing from response")

                authStorage.saveToken(token)
                authStorage.saveUser(user)
                _currentUser.value = user

                fetchActiveSession()
                fetchBlockedSites()

                Result.success(user)
            } else {
                val msg = response.errorBody()?.string() ?: "Invalid login credentials"
                Result.failure(Exception(msg))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun fetchActiveSession(): FocusSession? {
        val token = authStorage.getToken() ?: return null
        return try {
            val response = api.getActiveSession(token)
            consecutiveNetworkErrors = 0

            if (response.isSuccessful && response.body()?.success == true) {
                val session = response.body()?.session
                val isSessionActive = session != null && session.status == "active"
                val isFocusType = session?.sessionType == "Focus"
                val sessionId = session?.id ?: "unknown"

                val prevSession = _shieldState.value.activeSession

                if (isSessionActive && isFocusType) {
                    val remaining = session?.remainingTime ?: 0
                    
                    // State machine transitions
                    val currentStatus = _shieldState.value.shieldStatus
                    val nextStatus = if (currentStatus == ShieldStateEnum.PERMISSION_REQUIRED) {
                        ShieldStateEnum.PERMISSION_REQUIRED
                    } else {
                        ShieldStateEnum.ACTIVE
                    }

                    _shieldState.value = _shieldState.value.copy(
                        shieldStatus = nextStatus,
                        isShieldActive = nextStatus == ShieldStateEnum.ACTIVE,
                        activeSession = session,
                        remainingSeconds = remaining
                    )

                    // Idempotent notification triggers
                    notificationHelper.notifyShieldStarted(sessionId, session?.sessionType)

                    if (remaining in 1..60) {
                        notificationHelper.notifySessionEnding(sessionId, session?.sessionType)
                    }

                } else {
                    val wasActive = prevSession != null
                    if (wasActive) {
                        notificationHelper.notifySessionCompleted(prevSession.id, prevSession.sessionType)
                    }

                    _shieldState.value = _shieldState.value.copy(
                        shieldStatus = ShieldStateEnum.INACTIVE,
                        isShieldActive = false,
                        activeSession = null,
                        remainingSeconds = 0
                    )
                }
                session
            } else {
                _shieldState.value = _shieldState.value.copy(
                    shieldStatus = ShieldStateEnum.INACTIVE,
                    isShieldActive = false,
                    activeSession = null,
                    remainingSeconds = 0
                )
                null
            }
        } catch (e: Exception) {
            consecutiveNetworkErrors++
            // Network fault tolerance: keep current shield state during transient offline retries
            null
        }
    }

    suspend fun startFocusSession(durationSeconds: Int = 1500, type: String = "Focus"): Result<FocusSession> {
        val token = authStorage.getToken() ?: return Result.failure(Exception("Not authenticated"))
        return try {
            _shieldState.value = _shieldState.value.copy(shieldStatus = ShieldStateEnum.STARTING)

            val body = mapOf(
                "duration" to durationSeconds,
                "sessionType" to type
            )
            val response = api.startSession(token, body)
            if (response.isSuccessful && response.body()?.success == true) {
                val session = response.body()?.session ?: throw Exception("Session payload missing")

                _shieldState.value = _shieldState.value.copy(
                    shieldStatus = ShieldStateEnum.ACTIVE,
                    isShieldActive = true,
                    activeSession = session,
                    remainingSeconds = session.duration
                )

                notificationHelper.notifyShieldStarted(session.id, session.sessionType)
                fetchBlockedSites()

                Result.success(session)
            } else {
                _shieldState.value = _shieldState.value.copy(shieldStatus = ShieldStateEnum.INACTIVE)
                Result.failure(Exception("Failed to start session on server"))
            }
        } catch (e: Exception) {
            _shieldState.value = _shieldState.value.copy(shieldStatus = ShieldStateEnum.INACTIVE)
            Result.failure(e)
        }
    }

    suspend fun stopFocusSession(): Result<FocusSession?> {
        val token = authStorage.getToken() ?: return Result.failure(Exception("Not authenticated"))
        return try {
            _shieldState.value = _shieldState.value.copy(shieldStatus = ShieldStateEnum.STOPPING)

            val body = mapOf("status" to "cancelled")
            val response = api.updateActiveSession(token, body)
            val prevSession = _shieldState.value.activeSession

            if (response.isSuccessful) {
                if (prevSession != null) {
                    notificationHelper.notifySessionCompleted(prevSession.id, prevSession.sessionType)
                }

                _shieldState.value = _shieldState.value.copy(
                    shieldStatus = ShieldStateEnum.INACTIVE,
                    isShieldActive = false,
                    activeSession = null,
                    remainingSeconds = 0
                )
                Result.success(response.body()?.session)
            } else {
                Result.failure(Exception("Failed to stop session"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun fetchBlockedSites(): List<String> {
        val token = authStorage.getToken() ?: return emptyList()
        return try {
            val response = api.getBlockSites(token)
            if (response.isSuccessful && response.body()?.success == true) {
                val domains = response.body()?.sites?.filter { it.enabled }?.map { it.website } ?: emptyList()
                _shieldState.value = _shieldState.value.copy(blockedDomains = domains)
                domains
            } else {
                emptyList()
            }
        } catch (e: Exception) {
            emptyList()
        }
    }

    fun logout() {
        authStorage.clear()
        _currentUser.value = null
        _shieldState.value = MobileShieldState()
    }

    companion object {
        @Volatile
        private var INSTANCE: FocusRepository? = null

        fun getInstance(context: Context): FocusRepository {
            return INSTANCE ?: synchronized(this) {
                val instance = FocusRepository(context.applicationContext)
                INSTANCE = instance
                instance
            }
        }
    }
}
