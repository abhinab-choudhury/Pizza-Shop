package com.pizzashop.data.repository

import com.pizzashop.data.remote.AuthApi
import com.pizzashop.domain.model.AuthResponse
import com.pizzashop.domain.model.User
import com.pizzashop.domain.repository.AuthRepository

class AuthRepositoryImpl(
    private val authApi: AuthApi,
) : AuthRepository {

    private var cachedToken: String? = null
    private var cachedRefreshToken: String? = null

    override suspend fun login(email: String, password: String): AuthResponse {
        val response = authApi.login(email, password)
        cachedToken = response.accessToken
        return response
    }

    override suspend fun register(email: String, name: String, password: String): AuthResponse {
        val response = authApi.register(email, name, password)
        cachedToken = response.accessToken
        return response
    }

    override suspend fun sendOtp(email: String): Result<Unit> {
        return authApi.sendOtp(email)
    }

    override suspend fun verifyOtp(email: String, code: String): AuthResponse {
        val response = authApi.verifyOtp(email, code)
        cachedToken = response.accessToken
        return response
    }

    override suspend fun refreshToken(): String? {
        val token = cachedRefreshToken ?: return null
        return try {
            val newToken = authApi.refreshToken(token)
            cachedToken = newToken
            newToken
        } catch (e: Exception) {
            null
        }
    }

    override suspend fun logout() {
        cachedToken = null
        cachedRefreshToken = null
    }

    override suspend fun getCurrentUser(): User? {
        val token = cachedToken ?: return null
        return try {
            authApi.getProfile(token)
        } catch (e: Exception) {
            null
        }
    }

    override fun getAccessToken(): String? = cachedToken

    override fun isLoggedIn(): Boolean = cachedToken != null
}
