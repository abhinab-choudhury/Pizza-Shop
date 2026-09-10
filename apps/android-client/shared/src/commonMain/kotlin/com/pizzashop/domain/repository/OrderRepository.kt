package com.pizzashop.domain.repository

import com.pizzashop.domain.model.*

interface OrderRepository {
    suspend fun placeOrder(request: OrderRequest): Order
    suspend fun getOrders(): List<Order>
    suspend fun getOrder(id: String): Order?
}
