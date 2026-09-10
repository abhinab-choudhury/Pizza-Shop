package com.pizzashop.data.remote

import com.pizzashop.domain.model.Pizza
import io.ktor.client.*
import io.ktor.client.call.*
import io.ktor.client.request.*

class ProductApi(private val httpClient: HttpClient, private val baseUrl: String) {

    suspend fun getMenu(token: String?): List<Pizza> {
        return httpClient.get("$baseUrl/products") {
            token?.let { header("Authorization", "Bearer $it") }
        }.body()
    }

    suspend fun getProduct(id: String, token: String?): Pizza {
        return httpClient.get("$baseUrl/products/$id") {
            token?.let { header("Authorization", "Bearer $it") }
        }.body()
    }
}
