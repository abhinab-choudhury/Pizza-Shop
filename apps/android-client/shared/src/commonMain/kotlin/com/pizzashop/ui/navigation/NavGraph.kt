package com.pizzashop.ui.navigation

import androidx.compose.runtime.Composable
import androidx.navigation.NavHostController
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.navArgument
import com.pizzashop.ui.screens.cart.CartScreen
import com.pizzashop.ui.screens.checkout.CheckoutScreen
import com.pizzashop.ui.screens.login.LoginScreen
import com.pizzashop.ui.screens.menu.MenuScreen
import com.pizzashop.ui.screens.orders.OrdersScreen

object Routes {
    const val LOGIN = "login"
    const val MENU = "menu"
    const val CART = "cart"
    const val CHECKOUT = "checkout"
    const val ORDERS = "orders"
}

@Composable
fun PizzaNavGraph(
    navController: NavHostController,
    startDestination: String = Routes.LOGIN,
) {
    NavHost(
        navController = navController,
        startDestination = startDestination,
    ) {
        composable(Routes.LOGIN) {
            LoginScreen(
                onLoginSuccess = {
                    navController.navigate(Routes.MENU) {
                        popUpTo(Routes.LOGIN) { inclusive = true }
                    }
                },
            )
        }

        composable(Routes.MENU) {
            MenuScreen(
                onNavigateToCart = { navController.navigate(Routes.CART) },
                onNavigateToOrders = { navController.navigate(Routes.ORDERS) },
            )
        }

        composable(Routes.CART) {
            CartScreen(
                onCheckout = { navController.navigate(Routes.CHECKOUT) },
                onBack = { navController.popBackStack() },
            )
        }

        composable(Routes.CHECKOUT) {
            CheckoutScreen(
                onOrderPlaced = {
                    navController.navigate(Routes.ORDERS) {
                        popUpTo(Routes.MENU) { inclusive = false }
                    }
                },
                onBack = { navController.popBackStack() },
            )
        }

        composable(Routes.ORDERS) {
            OrdersScreen(
                onBack = { navController.popBackStack() },
                onNavigateToMenu = {
                    navController.navigate(Routes.MENU) {
                        popUpTo(Routes.MENU) { inclusive = true }
                    }
                },
            )
        }
    }
}
