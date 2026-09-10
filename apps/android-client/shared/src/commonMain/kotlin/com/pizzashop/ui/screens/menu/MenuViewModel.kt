package com.pizzashop.ui.screens.menu

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.pizzashop.domain.model.Pizza
import com.pizzashop.domain.usecase.GetMenuUseCase
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

data class MenuUiState(
    val pizzas: List<Pizza> = emptyList(),
    val filteredPizzas: List<Pizza> = emptyList(),
    val searchQuery: String = "",
    val selectedCategory: String = "all",
    val isLoading: Boolean = false,
    val error: String? = null,
)

class MenuViewModel(
    private val getMenuUseCase: GetMenuUseCase,
) : ViewModel() {

    private val _uiState = MutableStateFlow(MenuUiState())
    val uiState: StateFlow<MenuUiState> = _uiState.asStateFlow()

    init {
        loadMenu()
    }

    fun loadMenu() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            try {
                val pizzas = getMenuUseCase()
                _uiState.value = _uiState.value.copy(
                    pizzas = pizzas,
                    filteredPizzas = pizzas,
                    isLoading = false,
                )
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(
                    error = e.message ?: "Failed to load menu",
                    isLoading = false,
                )
            }
        }
    }

    fun onSearchQueryChange(query: String) {
        _uiState.value = _uiState.value.copy(searchQuery = query)
        filterPizzas()
    }

    fun onCategoryChange(category: String) {
        _uiState.value = _uiState.value.copy(selectedCategory = category)
        filterPizzas()
    }

    private fun filterPizzas() {
        val state = _uiState.value
        var filtered = state.pizzas

        if (state.selectedCategory != "all") {
            filtered = filtered.filter { it.category == state.selectedCategory }
        }

        if (state.searchQuery.isNotBlank()) {
            filtered = filtered.filter {
                it.name.contains(state.searchQuery, ignoreCase = true) ||
                    it.description.contains(state.searchQuery, ignoreCase = true)
            }
        }

        _uiState.value = _uiState.value.copy(filteredPizzas = filtered)
    }
}
