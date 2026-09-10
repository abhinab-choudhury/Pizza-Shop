package com.pizzashop.data.local

expect class DatabaseDriverFactory {
    fun createDriver(): app.cash.sqldelight.db.SqlDriver
}
