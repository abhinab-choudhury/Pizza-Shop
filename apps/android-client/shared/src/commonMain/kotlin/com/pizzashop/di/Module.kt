package com.pizzashop.di

import com.pizzashop.data.local.CartLocalDataSource
import com.pizzashop.data.remote.AuthApi
import com.pizzashop.data.remote.OrderApi
import com.pizzashop.data.remote.ProductApi
import com.pizzashop.data.repository.AuthRepositoryImpl
import com.pizzashop.data.repository.OrderRepositoryImpl
import com.pizzashop.data.repository.ProductRepositoryImpl
import com.pizzashop.domain.repository.AuthRepository
import com.pizzashop.domain.repository.OrderRepository
import com.pizzashop.domain.repository.ProductRepository
import com.pizzashop.domain.usecase.*
import com.pizzashop.ui.screens.cart.CartViewModel
import com.pizzashop.ui.screens.checkout.CheckoutViewModel
import com.pizzashop.ui.screens.login.LoginViewModel
import com.pizzashop.ui.screens.menu.MenuViewModel
import com.pizzashop.ui.screens.orders.OrdersViewModel
import org.koin.core.module.dsl.factoryOf
import org.koin.core.module.dsl.singleOf
import org.koin.dsl.bind
import org.koin.dsl.module

val sharedModule = module {
    single { AuthApi(get(), getProperty("BASE_URL")) }
    single { ProductApi(get(), getProperty("BASE_URL")) }
    single { OrderApi(get(), getProperty("BASE_URL")) }

    single { CartLocalDataSource(get()) }

    singleOf(::AuthRepositoryImpl) bind AuthRepository::class
    singleOf(::ProductRepositoryImpl) bind ProductRepository::class
    singleOf(::OrderRepositoryImpl) bind OrderRepository::class

    factory { LoginUseCase(get()) }
    factory { RegisterUseCase(get()) }
    factory { SendOtpUseCase(get()) }
    factory { VerifyOtpUseCase(get()) }
    factory { LogoutUseCase(get()) }
    factory { GetCurrentUserUseCase(get()) }
    factory { IsLoggedInUseCase(get()) }
    factory { GetMenuUseCase(get()) }
    factory { SearchProductsUseCase(get()) }
    factory { GetProductUseCase(get()) }
    factory { PlaceOrderUseCase(get()) }
    factory { GetOrdersUseCase(get()) }
    factory { GetOrderUseCase(get()) }

    factory { LoginViewModel(get(), get(), get(), get()) }
    factory { MenuViewModel(get(), get()) }
    factory { CartViewModel(get()) }
    factory { CheckoutViewModel(get(), get()) }
    factory { OrdersViewModel(get()) }
}
