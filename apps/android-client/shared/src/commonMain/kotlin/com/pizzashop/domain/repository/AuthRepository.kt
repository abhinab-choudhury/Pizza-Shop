package com.pizzashop.domain.repository

import com.pizzashop.domain.model.*

interface AuthRepository {
    suspend fun login(email: String, password: String): AuthResponse
    suspend fun register(email: String, name: String, password: String): AuthResponse
    suspend fun sendOtp(email: String): Result<Unit>
    suspend fun verifyOtp(email: String, code: String): AuthResponse
    suspend fun refreshToken(): String?
    suspend fun logout()
    suspend fun getCurrentUser(): User?
    fun getAccessToken(): String?
    fun isLoggedIn(): Boolean
}
