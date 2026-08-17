package com.focusflow.companion.data.storage

import android.content.Context
import android.content.SharedPreferences
import com.focusflow.companion.data.model.User
import com.google.gson.Gson

/**
 * AuthStorage — Secure SharedPreferences wrapper for token & user persistence on Android
 */
class AuthStorage(context: Context) {

    private val prefs: SharedPreferences = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
    private val gson = Gson()

    fun saveToken(token: String) {
        val cleanToken = if (token.startsWith("Bearer ")) token else "Bearer $token"
        prefs.edit().putString(KEY_TOKEN, cleanToken).apply()
    }

    fun getToken(): String? {
        return prefs.getString(KEY_TOKEN, null)
    }

    fun saveUser(user: User) {
        val json = gson.toJson(user)
        prefs.edit().putString(KEY_USER, json).apply()
    }

    fun getUser(): User? {
        val json = prefs.getString(KEY_USER, null) ?: return null
        return try {
            gson.fromJson(json, User::class.java)
        } catch (e: Exception) {
            null
        }
    }

    fun clear() {
        prefs.edit().clear().apply()
    }

    fun isLoggedIn(): Boolean {
        return !getToken().isNull_orEmpty()
    }

    private fun String?.isNull_orEmpty(): Boolean {
        return this == null || this.trim().isEmpty()
    }

    companion object {
        private const val PREFS_NAME = "focusflow_auth_prefs"
        private const val KEY_TOKEN = "jwt_token"
        private const val KEY_USER = "user_json"
    }
}
