package com.pizzashop.di

import android.content.Context
import com.pizzashop.data.local.CartLocalDataSource
import com.pizzashop.data.local.DatabaseDriverFactory
import com.pizzashop.data.remote.HttpClientFactory
import com.pizzashop.db.PizzaShopDatabase
import io.ktor.client.*
import org.koin.android.ext.koin.androidContext
import org.koin.dsl.module

val androidModule = module {
    single { HttpClientFactory().create(getProperty("BASE_URL")) }
    single { DatabaseDriverFactory(androidContext()).createDriver() }
    single { PizzaShopDatabase(get()) }
    single { CartLocalDataSource(get()) }
}
