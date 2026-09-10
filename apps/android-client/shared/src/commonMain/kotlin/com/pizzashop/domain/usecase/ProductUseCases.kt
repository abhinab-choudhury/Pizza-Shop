package com.pizzashop.domain.usecase

import com.pizzashop.domain.model.Pizza
import com.pizzashop.domain.repository.ProductRepository

class GetMenuUseCase(private val repository: ProductRepository) {
    suspend operator fun invoke(): List<Pizza> {
        return repository.getMenu()
    }
}

class SearchProductsUseCase(private val repository: ProductRepository) {
    suspend operator fun invoke(query: String): List<Pizza> {
        return repository.searchProducts(query)
    }
}

class GetProductUseCase(private val repository: ProductRepository) {
    suspend operator fun invoke(id: String): Pizza? {
        return repository.getProduct(id)
    }
}
