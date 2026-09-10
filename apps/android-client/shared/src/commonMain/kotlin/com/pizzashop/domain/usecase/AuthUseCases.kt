package com.pizzashop.domain.usecase

import com.pizzashop.domain.model.AuthResponse
import com.pizzashop.domain.repository.AuthRepository

class LoginUseCase(private val repository: AuthRepository) {
    suspend operator fun invoke(email: String, password: String): AuthResponse {
        return repository.login(email, password)
    }
}

class RegisterUseCase(private val repository: AuthRepository) {
    suspend operator fun invoke(
        email: String,
        name: String,
        password: String,
    ): AuthResponse {
        return repository.register(email, name, password)
    }
}

class SendOtpUseCase(private val repository: AuthRepository) {
    suspend operator fun invoke(email: String): Result<Unit> {
        return repository.sendOtp(email)
    }
}

class VerifyOtpUseCase(private val repository: AuthRepository) {
    suspend operator fun invoke(email: String, code: String): AuthResponse {
        return repository.verifyOtp(email, code)
    }
}

class LogoutUseCase(private val repository: AuthRepository) {
    suspend operator fun invoke() {
        repository.logout()
    }
}

class GetCurrentUserUseCase(private val repository: AuthRepository) {
    suspend operator fun invoke(): com.pizzashop.domain.model.User? {
        return repository.getCurrentUser()
    }
}

class IsLoggedInUseCase(private val repository: AuthRepository) {
    operator fun invoke(): Boolean {
        return repository.isLoggedIn()
    }
}
