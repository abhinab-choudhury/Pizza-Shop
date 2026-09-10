package com.pizzashop.data.remote

import com.pizzashop.domain.model.*
import io.ktor.client.*
import io.ktor.client.call.*
import io.ktor.client.request.*
import io.ktor.http.*

class OrderApi(private val httpClient: HttpClient, private val baseUrl: String) {

    suspend fun placeOrder(request: OrderRequest, token: String): Order {
        return httpClient.post("$baseUrl/orders") {
            contentType(ContentType.Application.Json)
            header("Authorization", "Bearer $token")
            setBody(request)
        }.body()
    }

    suspend fun getOrders(token: String): List<Order> {
        return httpClient.get("$baseUrl/orders") {
            header("Authorization", "Bearer $token")
        }.body()
    }

    suspend fun getOrder(id: String, token: String): Order {
        return httpClient.get("$baseUrl/orders/$id") {
            header("Authorization", "Bearer $token")
        }.body()
    }
}
