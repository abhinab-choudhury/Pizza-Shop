package com.pizzashop.domain.usecase

import com.pizzashop.domain.model.*
import com.pizzashop.domain.repository.OrderRepository

class PlaceOrderUseCase(private val repository: OrderRepository) {
    suspend operator fun invoke(request: OrderRequest): Order {
        return repository.placeOrder(request)
    }
}

class GetOrdersUseCase(private val repository: OrderRepository) {
    suspend operator fun invoke(): List<Order> {
        return repository.getOrders()
    }
}

class GetOrderUseCase(private val repository: OrderRepository) {
    suspend operator fun invoke(id: String): Order? {
        return repository.getOrder(id)
    }
}
