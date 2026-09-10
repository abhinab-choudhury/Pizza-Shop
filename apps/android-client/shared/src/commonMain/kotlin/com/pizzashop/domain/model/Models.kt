package com.pizzashop.domain.model

import kotlinx.serialization.Serializable

@Serializable
data class Pizza(
    val id: String,
    val name: String,
    val description: String,
    val price: Double,
    val imageUrl: String? = null,
    val category: String = "classic",
    val isAvailable: Boolean = true,
)

@Serializable
data class CartItem(
    val pizza: Pizza,
    val quantity: Int = 1,
) {
    val totalPrice: Double
        get() = pizza.price * quantity
}

@Serializable
data class Order(
    val id: String,
    val items: List<CartItem>,
    val total: Double,
    val status: String = "pending",
    val createdAt: String,
)

@Serializable
data class OrderRequest(
    val items: List<OrderItemRequest>,
    val deliveryAddress: String,
    val paymentMethod: String,
)

@Serializable
data class OrderItemRequest(
    val pizzaId: String,
    val quantity: Int,
)
