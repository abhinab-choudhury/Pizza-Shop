package com.pizzashop.domain.repository

import com.pizzashop.domain.model.*

interface ProductRepository {
    suspend fun getMenu(): List<Pizza>
    suspend fun getProduct(id: String): Pizza?
    suspend fun searchProducts(query: String): List<Pizza>
}
