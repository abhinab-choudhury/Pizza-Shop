package com.pizzashop.data.local

import android.content.Context
import app.cash.sqldelight.db.SqlDriver
import app.cash.sqldelight.driver.android.AndroidSqliteDriver
import com.pizzashop.db.PizzaShopDatabase

actual class DatabaseDriverFactory(private val context: Context) {
    actual fun createDriver(): SqlDriver {
        return AndroidSqliteDriver(
            PizzaShopDatabase.Schema,
            context,
            "pizza_shop.db",
        )
    }
}
