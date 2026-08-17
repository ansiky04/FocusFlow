package com.focusflow.companion.data.api

import com.focusflow.companion.data.model.*
import retrofit2.Response
import retrofit2.http.*

/**
 * Retrofit REST API interface for FocusFlow backend
 * Connects Android Mobile Companion to Render backend (https://focusflow-api-aazl.onrender.com/api)
 */
interface FocusFlowApiService {

    @POST("auth/login")
    suspend fun login(@Body body: AuthRequest): Response<AuthResponse>

    @POST("auth/register")
    suspend fun register(@Body body: AuthRequest): Response<AuthResponse>

    @GET("auth/me")
    suspend fun getCurrentUser(@Header("Authorization") token: String): Response<AuthResponse>

    @GET("sessions/active")
    suspend fun getActiveSession(@Header("Authorization") token: String): Response<ActiveSessionResponse>

    @POST("sessions/start")
    suspend fun startSession(
        @Header("Authorization") token: String,
        @Body body: Map<String, @JvmSuppressWildcards Any>
    ): Response<ActiveSessionResponse>

    @PUT("sessions/active")
    suspend fun updateActiveSession(
        @Header("Authorization") token: String,
        @Body body: Map<String, @JvmSuppressWildcards Any>
    ): Response<ActiveSessionResponse>

    @GET("block-sites")
    suspend fun getBlockSites(@Header("Authorization") token: String): Response<BlockSitesResponse>
}
