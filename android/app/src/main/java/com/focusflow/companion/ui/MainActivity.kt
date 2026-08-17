package com.focusflow.companion.ui

import android.content.Intent
import android.net.VpnService
import android.os.Bundle
import android.view.View
import android.widget.Button
import android.widget.LinearLayout
import android.widget.TextView
import android.widget.Toast
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.focusflow.companion.R
import com.focusflow.companion.data.model.ShieldStateEnum
import com.focusflow.companion.data.repository.FocusRepository
import com.focusflow.companion.service.FocusShieldVpnService
import kotlinx.coroutines.delay
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch
import java.util.Locale

/**
 * MainActivity — Main Dashboard for FocusFlow Android Mobile Companion
 * Handles VpnService permission prompts, automatic VPN start/stop execution,
 * remaining time countdown formatting, blocked site rendering, and sync polling.
 */
class MainActivity : AppCompatActivity() {

    private lateinit var repository: FocusRepository
    private lateinit var userNameTextView: TextView
    private lateinit var userEmailTextView: TextView
    private lateinit var sessionStatusTextView: TextView
    private lateinit var timerCountdownTextView: TextView
    private lateinit var shieldStatusTextView: TextView
    private lateinit var startSessionButton: Button
    private lateinit var stopSessionButton: Button
    private lateinit var logoutButton: Button
    private lateinit var blockedSitesTitleTextView: TextView
    private lateinit var blockedSitesListTextView: TextView
    private lateinit var syncStatusTextView: TextView
    private lateinit var permissionBannerLayout: LinearLayout
    private lateinit var grantPermissionButton: Button

    private val vpnPermissionLauncher = registerForActivityResult(
        ActivityResultContracts.StartActivityForResult()
    ) { result ->
        if (result.resultCode == RESULT_OK) {
            Toast.makeText(this, "VPN permission granted! Activating Focus Shield...", Toast.LENGTH_SHORT).show()
            repository.updateShieldStatus(ShieldStateEnum.ACTIVE)
            startVpnService()
        } else {
            Toast.makeText(this, "VPN permission denied. Focus Shield inactive.", Toast.LENGTH_LONG).show()
            repository.updateShieldStatus(ShieldStateEnum.PERMISSION_REQUIRED, isShieldActive = false)
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        repository = FocusRepository.getInstance(this)

        if (!repository.isLoggedIn()) {
            startActivity(Intent(this, LoginActivity::class.java))
            finish()
            return
        }

        setContentView(R.layout.activity_main)

        userNameTextView = findViewById(R.id.userNameTextView)
        userEmailTextView = findViewById(R.id.userEmailTextView)
        sessionStatusTextView = findViewById(R.id.sessionStatusTextView)
        timerCountdownTextView = findViewById(R.id.timerCountdownTextView)
        shieldStatusTextView = findViewById(R.id.shieldStatusTextView)
        startSessionButton = findViewById(R.id.startSessionButton)
        stopSessionButton = findViewById(R.id.stopSessionButton)
        logoutButton = findViewById(R.id.logoutButton)
        blockedSitesTitleTextView = findViewById(R.id.blockedSitesTitleTextView)
        blockedSitesListTextView = findViewById(R.id.blockedSitesListTextView)
        syncStatusTextView = findViewById(R.id.syncStatusTextView)
        permissionBannerLayout = findViewById(R.id.permissionBannerLayout)
        grantPermissionButton = findViewById(R.id.grantPermissionButton)

        val user = repository.currentUser.value
        userNameTextView.text = user?.fullName ?: "FocusFlow Student"
        userEmailTextView.text = user?.email ?: ""

        logoutButton.setOnClickListener {
            stopVpnService()
            repository.logout()
            startActivity(Intent(this, LoginActivity::class.java))
            finish()
        }

        startSessionButton.setOnClickListener {
            triggerStartSession()
        }

        stopSessionButton.setOnClickListener {
            triggerStopSession()
        }

        grantPermissionButton.setOnClickListener {
            requestVpnPermission()
        }

        // Observe reactive StateFlow for active Focus Session & Shield State
        lifecycleScope.launch {
            repository.shieldState.collect { state ->
                val session = state.activeSession
                val isShieldOn = state.isShieldActive
                val status = state.shieldStatus

                if (session != null && session.status == "active") {
                    sessionStatusTextView.text = "${session.sessionType} Session Active"
                    sessionStatusTextView.setTextColor(getColor(android.R.color.white))

                    val mins = state.remainingSeconds / 60
                    val secs = state.remainingSeconds % 60
                    timerCountdownTextView.text = String.format(Locale.US, "%02d:%02d", mins, secs)

                    when (status) {
                        ShieldStateEnum.ACTIVE -> {
                            shieldStatusTextView.text = "🛡️ Focus Shield: ACTIVE (VPN Blocking)"
                            shieldStatusTextView.setTextColor(0xFF10B981.toInt())
                            permissionBannerLayout.visibility = View.GONE
                            startVpnService()
                        }
                        ShieldStateEnum.PERMISSION_REQUIRED -> {
                            shieldStatusTextView.text = "⚠️ Focus Shield: Permission Required"
                            shieldStatusTextView.setTextColor(0xFFEF4444.toInt())
                            permissionBannerLayout.visibility = View.VISIBLE
                        }
                        ShieldStateEnum.STARTING -> {
                            shieldStatusTextView.text = "🛡️ Focus Shield: Starting..."
                            shieldStatusTextView.setTextColor(0xFFF59E0B.toInt())
                            permissionBannerLayout.visibility = View.GONE
                        }
                        else -> {
                            shieldStatusTextView.text = "🛡️ Focus Shield: Standby"
                            shieldStatusTextView.setTextColor(0xFFF59E0B.toInt())
                            permissionBannerLayout.visibility = View.GONE
                        }
                    }

                    startSessionButton.visibility = View.GONE
                    stopSessionButton.visibility = View.VISIBLE
                } else {
                    sessionStatusTextView.text = "No active session"
                    sessionStatusTextView.setTextColor(0xFF94A3B8.toInt())
                    timerCountdownTextView.text = "25:00"
                    shieldStatusTextView.text = "🛡️ Focus Shield: Inactive"
                    shieldStatusTextView.setTextColor(0xFF94A3B8.toInt())
                    permissionBannerLayout.visibility = View.GONE

                    startSessionButton.visibility = View.VISIBLE
                    stopSessionButton.visibility = View.GONE

                    if (status != ShieldStateEnum.INACTIVE) {
                        stopVpnService()
                    }
                }

                val domains = state.blockedDomains
                blockedSitesTitleTextView.text = "BLOCKED WEBSITES (${domains.size})"
                if (domains.isNotEmpty()) {
                    blockedSitesListTextView.text = domains.joinToString(", ")
                } else {
                    blockedSitesListTextView.text = "youtube.com, instagram.com, facebook.com, x.com, reddit.com, discord.com"
                }
            }
        }

        // Periodic background polling loop (3s interval)
        lifecycleScope.launch {
            while (isActive) {
                repository.fetchActiveSession()
                repository.fetchBlockedSites()
                delay(3000)
            }
        }
    }

    private fun checkAndStartVpn() {
        val prepareIntent = VpnService.prepare(this)
        if (prepareIntent != null) {
            repository.updateShieldStatus(ShieldStateEnum.PERMISSION_REQUIRED, isShieldActive = false)
            vpnPermissionLauncher.launch(prepareIntent)
        } else {
            repository.updateShieldStatus(ShieldStateEnum.ACTIVE)
            startVpnService()
        }
    }

    private fun requestVpnPermission() {
        val prepareIntent = VpnService.prepare(this)
        if (prepareIntent != null) {
            vpnPermissionLauncher.launch(prepareIntent)
        } else {
            repository.updateShieldStatus(ShieldStateEnum.ACTIVE)
            startVpnService()
        }
    }

    private fun startVpnService() {
        val domains = ArrayList(repository.shieldState.value.blockedDomains)
        val intent = Intent(this, FocusShieldVpnService::class.java).apply {
            action = FocusShieldVpnService.ACTION_START_SHIELD
            putStringArrayListExtra(FocusShieldVpnService.EXTRA_BLOCKED_DOMAINS, domains)
        }
        try {
            startService(intent)
        } catch (e: Exception) {
            // Log or fallback
        }
    }

    private fun stopVpnService() {
        val intent = Intent(this, FocusShieldVpnService::class.java).apply {
            action = FocusShieldVpnService.ACTION_STOP_SHIELD
        }
        try {
            startService(intent)
        } catch (_: Exception) {}
    }

    private fun triggerStartSession() {
        startSessionButton.isEnabled = false
        lifecycleScope.launch {
            val result = repository.startFocusSession(1500, "Focus")
            startSessionButton.isEnabled = true
            result.onSuccess {
                Toast.makeText(this@MainActivity, "Focus Session started!", Toast.LENGTH_SHORT).show()
                checkAndStartVpn()
            }.onFailure { err ->
                Toast.makeText(this@MainActivity, "Failed to start session: ${err.message}", Toast.LENGTH_LONG).show()
            }
        }
    }

    private fun triggerStopSession() {
        stopSessionButton.isEnabled = false
        lifecycleScope.launch {
            val result = repository.stopFocusSession()
            stopSessionButton.isEnabled = true
            result.onSuccess {
                stopVpnService()
                Toast.makeText(this@MainActivity, "Focus Session stopped. Shield deactivated.", Toast.LENGTH_SHORT).show()
            }.onFailure { err ->
                Toast.makeText(this@MainActivity, "Failed to stop session: ${err.message}", Toast.LENGTH_LONG).show()
            }
        }
    }
}
