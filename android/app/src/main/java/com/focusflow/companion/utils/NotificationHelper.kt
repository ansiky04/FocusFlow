package com.focusflow.companion.utils

import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.Context
import android.os.Build
import androidx.core.app.NotificationCompat
import com.focusflow.companion.R

/**
 * NotificationHelper — Manages Android System Notifications for Focus Shield
 * Includes persistent deduplication to ensure notifications fire exactly ONCE per session event.
 */
class NotificationHelper(private val context: Context) {

    private val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
    private val prefs = context.getSharedPreferences("focusflow_notif_dedup", Context.MODE_PRIVATE)

    init {
        createNotificationChannel()
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "Focus Shield Notifications",
                NotificationManager.IMPORTANCE_DEFAULT
            ).apply {
                description = "Notifications for active focus sessions and shield updates"
            }
            notificationManager.createNotificationChannel(channel)
        }
    }

    private fun isNotified(category: String, sessionId: String): Boolean {
        val key = "${category}_$sessionId"
        return prefs.getBoolean(key, false)
    }

    private fun markNotified(category: String, sessionId: String) {
        val key = "${category}_$sessionId"
        prefs.edit().putBoolean(key, true).apply()
    }

    fun notifyShieldStarted(sessionId: String, sessionName: String? = "Focus Session") {
        if (isNotified("started", sessionId)) return
        markNotified("started", sessionId)

        val notification = NotificationCompat.Builder(context, CHANNEL_ID)
            .setSmallIcon(R.mipmap.ic_launcher)
            .setContentTitle("Focus Shield Active")
            .setContentText("Your distracting websites are blocked during this $sessionName.")
            .setPriority(NotificationCompat.PRIORITY_DEFAULT)
            .setAutoCancel(true)
            .build()

        notificationManager.notify(NOTIFICATION_ID_STARTED, notification)
    }

    fun notifySessionEnding(sessionId: String, sessionName: String? = "Focus Session") {
        if (isNotified("ending", sessionId)) return
        markNotified("ending", sessionId)

        val notification = NotificationCompat.Builder(context, CHANNEL_ID)
            .setSmallIcon(R.mipmap.ic_launcher)
            .setContentTitle("Focus Session Ending")
            .setContentText("Your Focus Shield will turn off when $sessionName ends.")
            .setPriority(NotificationCompat.PRIORITY_DEFAULT)
            .setAutoCancel(true)
            .build()

        notificationManager.notify(NOTIFICATION_ID_ENDING, notification)
    }

    fun notifySessionCompleted(sessionId: String, sessionName: String? = "Focus Session") {
        if (isNotified("completed", sessionId)) return
        markNotified("completed", sessionId)

        val notification = NotificationCompat.Builder(context, CHANNEL_ID)
            .setSmallIcon(R.mipmap.ic_launcher)
            .setContentTitle("Focus Session Complete")
            .setContentText("Your $sessionName has ended. Focus Shield is now OFF.")
            .setPriority(NotificationCompat.PRIORITY_DEFAULT)
            .setAutoCancel(true)
            .build()

        notificationManager.notify(NOTIFICATION_ID_COMPLETED, notification)
    }

    companion object {
        const val CHANNEL_ID = "focus_shield_channel"
        const val NOTIFICATION_ID_STARTED = 1001
        const val NOTIFICATION_ID_ENDING = 1002
        const val NOTIFICATION_ID_COMPLETED = 1003
    }
}
