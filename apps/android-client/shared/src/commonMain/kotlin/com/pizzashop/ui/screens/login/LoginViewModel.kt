package com.pizzashop.ui.screens.login

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.pizzashop.domain.usecase.LoginUseCase
import com.pizzashop.domain.usecase.RegisterUseCase
import com.pizzashop.domain.usecase.SendOtpUseCase
import com.pizzashop.domain.usecase.VerifyOtpUseCase
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

data class LoginUiState(
    val email: String = "",
    val password: String = "",
    val name: String = "",
    val otpCode: String = "",
    val isRegisterMode: Boolean = false,
    val isOtpMode: Boolean = false,
    val isLoading: Boolean = false,
    val error: String? = null,
    val otpSent: Boolean = false,
)

class LoginViewModel(
    private val loginUseCase: LoginUseCase,
    private val registerUseCase: RegisterUseCase,
    private val sendOtpUseCase: SendOtpUseCase,
    private val verifyOtpUseCase: VerifyOtpUseCase,
) : ViewModel() {

    private val _uiState = MutableStateFlow(LoginUiState())
    val uiState: StateFlow<LoginUiState> = _uiState.asStateFlow()

    fun onEmailChange(email: String) {
        _uiState.value = _uiState.value.copy(email = email)
    }

    fun onPasswordChange(password: String) {
        _uiState.value = _uiState.value.copy(password = password)
    }

    fun onNameChange(name: String) {
        _uiState.value = _uiState.value.copy(name = name)
    }

    fun onOtpCodeChange(code: String) {
        _uiState.value = _uiState.value.copy(otpCode = code)
    }

    fun toggleMode() {
        _uiState.value = _uiState.value.copy(
            isRegisterMode = !_uiState.value.isRegisterMode,
            error = null,
        )
    }

    fun toggleOtpMode() {
        _uiState.value = _uiState.value.copy(
            isOtpMode = !_uiState.value.isOtpMode,
            error = null,
            otpSent = false,
        )
    }

    fun login(onSuccess: () -> Unit) {
        val state = _uiState.value
        if (state.email.isBlank() || state.password.isBlank()) {
            _uiState.value = state.copy(error = "Please fill in all fields")
            return
        }

        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            try {
                loginUseCase(state.email, state.password)
                onSuccess()
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(
                    error = e.message ?: "Login failed",
                )
            } finally {
                _uiState.value = _uiState.value.copy(isLoading = false)
            }
        }
    }

    fun register(onSuccess: () -> Unit) {
        val state = _uiState.value
        if (state.email.isBlank() || state.password.isBlank() || state.name.isBlank()) {
            _uiState.value = state.copy(error = "Please fill in all fields")
            return
        }

        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            try {
                registerUseCase(state.email, state.name, state.password)
                onSuccess()
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(
                    error = e.message ?: "Registration failed",
                )
            } finally {
                _uiState.value = _uiState.value.copy(isLoading = false)
            }
        }
    }

    fun sendOtp() {
        val email = _uiState.value.email
        if (email.isBlank()) {
            _uiState.value = _uiState.value.copy(error = "Please enter your email")
            return
        }

        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            val result = sendOtpUseCase(email)
            result.fold(
                onSuccess = {
                    _uiState.value = _uiState.value.copy(otpSent = true, isLoading = false)
                },
                onFailure = { e ->
                    _uiState.value = _uiState.value.copy(
                        error = e.message ?: "Failed to send OTP",
                        isLoading = false,
                    )
                },
            )
        }
    }

    fun verifyOtp(onSuccess: () -> Unit) {
        val email = _uiState.value.email
        val code = _uiState.value.otpCode
        if (email.isBlank() || code.length != 6) {
            _uiState.value = _uiState.value.copy(error = "Enter the 6-digit code")
            return
        }

        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            try {
                verifyOtpUseCase(email, code)
                onSuccess()
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(
                    error = e.message ?: "Invalid OTP",
                )
            } finally {
                _uiState.value = _uiState.value.copy(isLoading = false)
            }
        }
    }
}
