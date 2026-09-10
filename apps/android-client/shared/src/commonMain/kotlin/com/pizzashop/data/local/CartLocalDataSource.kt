package com.pizzashop.data.local

import app.cash.sqldelight.coroutines.asFlow
import app.cash.sqldelight.coroutines.mapToOneOrNull
import com.pizzashop.db.PizzaShopDatabase
import com.pizzashop.domain.model.CartItem
import com.pizzashop.domain.model.Pizza
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map

class CartLocalDataSource(database: PizzaShopDatabase) {

    private val queries = database.cartQueries

    fun getCartItems(): Flow<List<CartItem>> {
        return queries.getAllCartItems().asFlow().map { list ->
            list.map { item ->
                CartItem(
                    pizza = Pizza(
                        id = item.pizzaId,
                        name = item.name,
                        description = item.description,
                        price = item.price,
                        imageUrl = item.imageUrl,
                        category = item.category,
                    ),
                    quantity = item.quantity.toInt(),
                )
            }
        }
    }

    fun getCartItemCount(): Flow<Long> {
        return queries.getCartItemCount().asFlow().map { it.value }
    }

    fun getCartTotal(): Flow<Double> {
        return queries.getCartTotal().asFlow().map { it.value ?: 0.0 }
    }

    suspend fun addToCart(pizza: Pizza, quantity: Int = 1) {
        val existing = queries.getCartItemByPizzaId(pizza.id).executeAsOneOrNull()
        if (existing != null) {
            queries.updateQuantity(
                quantity = existing.quantity + quantity,
                pizzaId = pizza.id,
            )
        } else {
            queries.insertCartItem(
                pizzaId = pizza.id,
                name = pizza.name,
                description = pizza.description,
                price = pizza.price,
                imageUrl = pizza.imageUrl,
                category = pizza.category,
                quantity = quantity.toLong(),
            )
        }
    }

    suspend fun updateQuantity(pizzaId: String, quantity: Int) {
        if (quantity <= 0) {
            queries.deleteCartItem(pizzaId)
        } else {
            queries.updateQuantity(
                quantity = quantity.toLong(),
                pizzaId = pizzaId,
            )
        }
    }

    suspend fun removeFromCart(pizzaId: String) {
        queries.deleteCartItem(pizzaId)
    }

    suspend fun clearCart() {
        queries.clearCart()
    }
}
