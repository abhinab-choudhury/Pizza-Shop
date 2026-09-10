package com.pizzashop.data.remote

import com.pizzashop.domain.model.*
import io.ktor.client.*
import io.ktor.client.call.*
import io.ktor.client.request.*
import io.ktor.http.*

class AuthApi(private val httpClient: HttpClient, private val baseUrl: String) {

    suspend fun login(email: String, password: String): AuthResponse {
        return httpClient.post("$baseUrl/auth/login") {
            contentType(ContentType.Application.Json)
            setBody(LoginRequest(email, password))
        }.body()
    }

    suspend fun register(email: String, name: String, password: String): AuthResponse {
        return httpClient.post("$baseUrl/auth/register") {
            contentType(ContentType.Application.Json)
            setBody(RegisterRequest(email, name, password))
        }.body()
    }

    suspend fun sendOtp(email: String): Result<Unit> {
        return try {
            httpClient.post("$baseUrl/auth/otp/send") {
                contentType(ContentType.Application.Json)
                setBody(OtpSendRequest(email))
            }.body()
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun verifyOtp(email: String, code: String): AuthResponse {
        return httpClient.post("$baseUrl/auth/otp/verify") {
            contentType(ContentType.Application.Json)
            setBody(OtpVerifyRequest(email, code))
        }.body()
    }

    suspend fun refreshToken(refreshToken: String): String {
        val response = httpClient.post("$baseUrl/auth/refresh") {
            contentType(ContentType.Application.Json)
            setBody(RefreshRequest(refreshToken))
        }.body<Map<String, String>>()
        return response["accessToken"] ?: throw Exception("No access token")
    }

    suspend fun getProfile(token: String): User {
        return httpClient.get("$baseUrl/auth/me") {
            header("Authorization", "Bearer $token")
        }.body()
    }
}
