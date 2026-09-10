package com.pizzashop.domain.model

import kotlinx.serialization.Serializable

@Serializable
data class User(
    val id: String,
    val email: String,
    val name: String? = null,
    val emailVerified: Boolean = false,
)

@Serializable
data class AuthResponse(
    val user: User,
    val accessToken: String,
)

@Serializable
data class LoginRequest(
    val email: String,
    val password: String,
)

@Serializable
data class RegisterRequest(
    val email: String,
    val name: String,
    val password: String,
)

@Serializable
data class OtpSendRequest(
    val email: String,
    val purpose: String = "login",
)

@Serializable
data class OtpVerifyRequest(
    val email: String,
    val code: String,
    val purpose: String = "login",
)

@Serializable
data class RefreshRequest(
    val refreshToken: String? = null,
)
