package com.pizzashop.data.repository

import com.pizzashop.data.remote.ProductApi
import com.pizzashop.domain.model.Pizza
import com.pizzashop.domain.repository.ProductRepository

class ProductRepositoryImpl(
    private val productApi: ProductApi,
    private val tokenProvider: () -> String?,
) : ProductRepository {

    override suspend fun getMenu(): List<Pizza> {
        return productApi.getMenu(tokenProvider())
    }

    override suspend fun getProduct(id: String): Pizza? {
        return try {
            productApi.getProduct(id, tokenProvider())
        } catch (e: Exception) {
            null
        }
    }

    override suspend fun searchProducts(query: String): List<Pizza> {
        return getMenu().filter {
            it.name.contains(query, ignoreCase = true) ||
                it.description.contains(query, ignoreCase = true)
        }
    }
}
