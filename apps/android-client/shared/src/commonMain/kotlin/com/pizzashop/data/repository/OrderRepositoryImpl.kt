package com.pizzashop.data.repository

import com.pizzashop.data.remote.OrderApi
import com.pizzashop.domain.model.*
import com.pizzashop.domain.repository.OrderRepository

class OrderRepositoryImpl(
    private val orderApi: OrderApi,
    private val tokenProvider: () -> String?,
) : OrderRepository {

    override suspend fun placeOrder(request: OrderRequest): Order {
        val token = tokenProvider() ?: throw IllegalStateException("Not authenticated")
        return orderApi.placeOrder(request, token)
    }

    override suspend fun getOrders(): List<Order> {
        val token = tokenProvider() ?: throw IllegalStateException("Not authenticated")
        return orderApi.getOrders(token)
    }

    override suspend fun getOrder(id: String): Order? {
        val token = tokenProvider() ?: throw IllegalStateException("Not authenticated")
        return try {
            orderApi.getOrder(id, token)
        } catch (e: Exception) {
            null
        }
    }
}
