package com.focusflow.companion.data.model

import com.google.gson.annotations.SerializedName

/**
 * Focus Shield State Enum for State Machine
 */
enum class ShieldStateEnum {
    INACTIVE,
    STARTING,
    ACTIVE,
    PERMISSION_REQUIRED,
    STOPPING
}

/**
 * User Profile model matching FocusFlow MongoDB User schema
 */
data class User(
    @SerializedName("_id") val id: String,
    val fullName: String,
    val email: String,
    val avatar: String? = "indigo",
    val studyGoal: Double? = 30.0,
    val dailyGoal: Double? = 6.0,
    val streak: Int? = 0
)

/**
 * Focus Session model matching FocusFlow MongoDB FocusSession schema
 */
data class FocusSession(
    @SerializedName("_id") val id: String,
    val userId: String,
    val duration: Int, // seconds
    val remainingTime: Int? = 0,
    val status: String, // 'active', 'paused', 'completed', 'cancelled'
    val sessionType: String, // 'Focus', 'Short Break', 'Long Break'
    val startTime: String? = null,
    val endTime: String? = null,
    val startedAt: String? = null,
    val endedAt: String? = null,
    val completed: Boolean = false
)

/**
 * Blocked Site model matching FocusFlow MongoDB BlockSite schema
 */
data class BlockSite(
    @SerializedName("_id") val id: String,
    val website: String,
    val category: String = "General",
    val enabled: Boolean = true
)

/**
 * Login / Register authentication payload requests
 */
data class AuthRequest(
    val email: String,
    val password: String,
    val fullName: String? = null
)

/**
 * Authentication response from backend POST /api/auth/login or /api/auth/register
 */
data class AuthResponse(
    val success: Boolean,
    val message: String? = null,
    val token: String? = null,
    val user: User? = null
)

/**
 * Active session response from backend GET /api/sessions/active
 */
data class ActiveSessionResponse(
    val success: Boolean,
    val session: FocusSession? = null
)

/**
 * Block sites list response from backend GET /api/block-sites
 */
data class BlockSitesResponse(
    val success: Boolean,
    val sites: List<BlockSite> = emptyList()
)

/**
 * Unified Focus Shield Mobile State for local UI & VpnService binding
 */
data class MobileShieldState(
    val shieldStatus: ShieldStateEnum = ShieldStateEnum.INACTIVE,
    val isShieldActive: Boolean = false,
    val activeSession: FocusSession? = null,
    val remainingSeconds: Int = 0,
    val blockedDomains: List<String> = emptyList(),
    val errorMessage: String? = null
)
