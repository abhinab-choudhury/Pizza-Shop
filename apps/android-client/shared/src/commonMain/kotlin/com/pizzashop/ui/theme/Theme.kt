package com.pizzashop.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

private val LightColorScheme = lightColorScheme(
    primary = Color(0xFFD32F2F),
    onPrimary = Color.White,
    primaryContainer = Color(0xFFEF5350),
    onPrimaryContainer = Color(0xFF410000),
    secondary = Color(0xFFFF8F00),
    onSecondary = Color.White,
    secondaryContainer = Color(0xFFFFE0B2),
    onSecondaryContainer = Color(0xFF2E1200),
    background = Color(0xFFFFFBFF),
    onBackground = Color(0xFF1C1B1F),
    surface = Color(0xFFFFFBFF),
    onSurface = Color(0xFF1C1B1F),
)

private val DarkColorScheme = darkColorScheme(
    primary = Color(0xFFEF5350),
    onPrimary = Color(0xFF690000),
    primaryContainer = Color(0xFF930000),
    onPrimaryContainer = Color(0xFFFFDAD4),
    secondary = Color(0xFFFFB74D),
    onSecondary = Color(0xFF2E1200),
    secondaryContainer = Color(0xFF5D3F00),
    onSecondaryContainer = Color(0xFFFFDDB3),
    background = Color(0xFF1C1B1F),
    onBackground = Color(0xFFE6E1E5),
    surface = Color(0xFF1C1B1F),
    onSurface = Color(0xFFE6E1E5),
)

@Composable
fun PizzaShopTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit,
) {
    val colorScheme = if (darkTheme) DarkColorScheme else LightColorScheme

    MaterialTheme(
        colorScheme = colorScheme,
        typography = Typography(),
        content = content,
    )
}
