package com.pizzashop.ui.screens.checkout

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.pizzashop.domain.model.OrderRequest
import com.pizzashop.domain.usecase.GetOrdersUseCase
import com.pizzashop.domain.usecase.PlaceOrderUseCase
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

data class CheckoutUiState(
    val deliveryAddress: String = "",
    val paymentMethod: String = "cash",
    val isLoading: Boolean = false,
    val error: String? = null,
    val orderPlaced: Boolean = false,
)

class CheckoutViewModel(
    private val placeOrderUseCase: PlaceOrderUseCase,
    private val getOrdersUseCase: GetOrdersUseCase,
) : ViewModel() {

    private val _uiState = MutableStateFlow(CheckoutUiState())
    val uiState: StateFlow<CheckoutUiState> = _uiState.asStateFlow()

    fun onAddressChange(address: String) {
        _uiState.value = _uiState.value.copy(deliveryAddress = address)
    }

    fun onPaymentMethodChange(method: String) {
        _uiState.value = _uiState.value.copy(paymentMethod = method)
    }

    fun placeOrder(items: List<com.pizzashop.domain.model.CartItem>) {
        val state = _uiState.value
        if (state.deliveryAddress.isBlank()) {
            _uiState.value = state.copy(error = "Please enter a delivery address")
            return
        }

        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            try {
                val request = OrderRequest(
                    items = items.map {
                        com.pizzashop.domain.model.OrderItemRequest(
                            pizzaId = it.pizza.id,
                            quantity = it.quantity,
                        )
                    },
                    deliveryAddress = state.deliveryAddress,
                    paymentMethod = state.paymentMethod,
                )
                placeOrderUseCase(request)
                _uiState.value = _uiState.value.copy(
                    orderPlaced = true,
                    isLoading = false,
                )
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(
                    error = e.message ?: "Failed to place order",
                    isLoading = false,
                )
            }
        }
    }
}
