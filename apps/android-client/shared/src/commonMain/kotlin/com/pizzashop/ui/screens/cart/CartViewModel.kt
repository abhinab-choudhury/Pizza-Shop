package com.pizzashop.ui.screens.cart

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.pizzashop.domain.model.CartItem
import com.pizzashop.domain.model.Pizza
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

data class CartUiState(
    val items: List<CartItem> = emptyList(),
    val total: Double = 0.0,
    val isLoading: Boolean = false,
    val error: String? = null,
)

class CartViewModel : ViewModel() {

    private val _uiState = MutableStateFlow(CartUiState())
    val uiState: StateFlow<CartUiState> = _uiState.asStateFlow()

    fun addItem(pizza: Pizza) {
        val currentItems = _uiState.value.items.toMutableList()
        val existingIndex = currentItems.indexOfFirst { it.pizza.id == pizza.id }

        if (existingIndex >= 0) {
            val existing = currentItems[existingIndex]
            currentItems[existingIndex] = existing.copy(quantity = existing.quantity + 1)
        } else {
            currentItems.add(CartItem(pizza = pizza))
        }

        updateState(currentItems)
    }

    fun removeItem(pizzaId: String) {
        val currentItems = _uiState.value.items.toMutableList()
        currentItems.removeAll { it.pizza.id == pizzaId }
        updateState(currentItems)
    }

    fun updateQuantity(pizzaId: String, quantity: Int) {
        val currentItems = _uiState.value.items.toMutableList()
        if (quantity <= 0) {
            currentItems.removeAll { it.pizza.id == pizzaId }
        } else {
            val index = currentItems.indexOfFirst { it.pizza.id == pizzaId }
            if (index >= 0) {
                currentItems[index] = currentItems[index].copy(quantity = quantity)
            }
        }
        updateState(currentItems)
    }

    fun clearCart() {
        updateState(emptyList())
    }

    private fun updateState(items: List<CartItem>) {
        val total = items.sumOf { it.totalPrice }
        _uiState.value = _uiState.value.copy(items = items, total = total)
    }
}
