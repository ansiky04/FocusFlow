package com.focusflow.companion.ui

import android.content.Intent
import android.os.Bundle
import android.view.View
import android.widget.Button
import android.widget.EditText
import android.widget.ProgressBar
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.focusflow.companion.R
import com.focusflow.companion.data.repository.FocusRepository
import kotlinx.coroutines.launch

/**
 * LoginActivity — Android Authentication Screen
 * Authenticates user credentials with Render backend (`POST /api/auth/login`)
 */
class LoginActivity : AppCompatActivity() {

    private lateinit var repository: FocusRepository
    private lateinit var emailEditText: EditText
    private lateinit var passwordEditText: EditText
    private lateinit var loginButton: Button
    private lateinit var progressBar: ProgressBar
    private lateinit var errorTextView: TextView

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        repository = FocusRepository.getInstance(this)

        if (repository.isLoggedIn()) {
            startActivity(Intent(this, MainActivity::class.java))
            finish()
            return
        }

        setContentView(R.layout.activity_login)

        emailEditText = findViewById(R.id.emailEditText)
        passwordEditText = findViewById(R.id.passwordEditText)
        loginButton = findViewById(R.id.loginButton)
        progressBar = findViewById(R.id.progressBar)
        errorTextView = findViewById(R.id.errorTextView)

        loginButton.setOnClickListener {
            performLogin()
        }
    }

    private fun performLogin() {
        val email = emailEditText.text.toString().trim()
        val password = passwordEditText.text.toString().trim()

        if (email.isEmpty() || password.isEmpty()) {
            showError("Please enter both email and password")
            return
        }

        hideError()
        showLoading(true)

        lifecycleScope.launch {
            val result = repository.login(email, password)
            showLoading(false)

            result.onSuccess {
                startActivity(Intent(this@LoginActivity, MainActivity::class.java))
                finish()
            }.onFailure { exception ->
                showError(exception.message ?: "Login failed. Please check your credentials.")
            }
        }
    }

    private fun showLoading(loading: Boolean) {
        progressBar.visibility = if (loading) View.VISIBLE else View.GONE
        loginButton.isEnabled = !loading
    }

    private fun showError(message: String) {
        errorTextView.text = message
        errorTextView.visibility = View.VISIBLE
    }

    private fun hideError() {
        errorTextView.visibility = View.GONE
    }
}
