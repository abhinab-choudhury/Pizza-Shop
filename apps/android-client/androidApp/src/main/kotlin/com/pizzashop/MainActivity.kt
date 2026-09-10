package com.pizzashop

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.Surface
import androidx.compose.ui.Modifier
import androidx.navigation.compose.rememberNavController
import com.pizzashop.di.androidModule
import com.pizzashop.di.sharedModule
import com.pizzashop.ui.navigation.PizzaNavGraph
import com.pizzashop.ui.theme.PizzaShopTheme
import org.koin.android.ext.koin.androidContext
import org.koin.android.ext.koin.androidLogger
import org.koin.core.context.startKoin

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        startKoin {
            androidLogger()
            androidContext(this@MainActivity)
            modules(androidModule, sharedModule)
            properties(mapOf("BASE_URL" to "http://10.0.2.2:3002"))
        }

        setContent {
            PizzaShopTheme {
                Surface(modifier = Modifier.fillMaxSize()) {
                    val navController = rememberNavController()
                    PizzaNavGraph(navController = navController)
                }
            }
        }
    }
}
