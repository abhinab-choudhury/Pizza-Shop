package com.pizzashop.ui.screens.menu

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.ShoppingCart
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import com.pizzashop.domain.model.Pizza
import org.koin.compose.viewmodel.koinViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MenuScreen(
    onNavigateToCart: () -> Unit,
    onNavigateToOrders: () -> Unit,
    viewModel: MenuViewModel = koinViewModel(),
) {
    val uiState by viewModel.uiState.collectAsState()
    val categories = listOf("all", "classic", "specialty", "vegetarian", "dessert")

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Pizza Menu") },
                actions = {
                    IconButton(onClick = onNavigateToOrders) {
                        Icon(Icons.Default.ShoppingCart, "Orders")
                    }
                },
            )
        },
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding),
        ) {
            // Search bar
            OutlinedTextField(
                value = uiState.searchQuery,
                onValueChange = viewModel::onSearchQueryChange,
                label = { Text("Search pizzas...") },
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp, vertical = 8.dp),
                singleLine = true,
            )

            // Category chips
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp, vertical = 8.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp),
            ) {
                categories.forEach { category ->
                    FilterChip(
                        selected = uiState.selectedCategory == category,
                        onClick = { viewModel.onCategoryChange(category) },
                        label = { Text(category.replaceFirstChar { it.uppercase() }) },
                    )
                }
            }

            // Pizza grid
            when {
                uiState.isLoading -> {
                    Box(
                        modifier = Modifier.fillMaxSize(),
                        contentAlignment = Alignment.Center,
                    ) {
                        CircularProgressIndicator()
                    }
                }
                uiState.error != null -> {
                    Box(
                        modifier = Modifier.fillMaxSize(),
                        contentAlignment = Alignment.Center,
                    ) {
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Text(
                                text = uiState.error ?: "Unknown error",
                                color = MaterialTheme.colorScheme.error,
                            )
                            Spacer(modifier = Modifier.height(8.dp))
                            Button(onClick = viewModel::loadMenu) {
                                Text("Retry")
                            }
                        }
                    }
                }
                uiState.filteredPizzas.isEmpty() -> {
                    Box(
                        modifier = Modifier.fillMaxSize(),
                        contentAlignment = Alignment.Center,
                    ) {
                        Text(
                            text = "No pizzas found",
                            style = MaterialTheme.typography.bodyLarge,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                        )
                    }
                }
                else -> {
                    LazyVerticalGrid(
                        columns = GridCells.Fixed(2),
                        contentPadding = PaddingValues(16.dp),
                        verticalArrangement = Arrangement.spacedBy(12.dp),
                        horizontalArrangement = Arrangement.spacedBy(12.dp),
                    ) {
                        items(uiState.filteredPizzas) { pizza ->
                            PizzaCard(pizza = pizza)
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun PizzaCard(pizza: Pizza) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { },
    ) {
        Column(
            modifier = Modifier.padding(12.dp),
        ) {
            // Placeholder for pizza image
            Surface(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(120.dp),
                color = MaterialTheme.colorScheme.surfaceVariant,
                shape = MaterialTheme.shapes.medium,
            ) {
                Box(contentAlignment = Alignment.Center) {
                    Text(
                        text = "🍕",
                        style = MaterialTheme.typography.headlineLarge,
                    )
                }
            }

            Spacer(modifier = Modifier.height(8.dp))

            Text(
                text = pizza.name,
                style = MaterialTheme.typography.titleSmall,
                fontWeight = FontWeight.Bold,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis,
            )

            Text(
                text = pizza.description,
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                maxLines = 2,
                overflow = TextOverflow.Ellipsis,
            )

            Spacer(modifier = Modifier.height(8.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically,
            ) {
                Text(
                    text = "$${String.format("%.2f", pizza.price)}",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.primary,
                )

                FilledTonalButton(
                    onClick = { },
                    contentPadding = PaddingValues(horizontal = 12.dp, vertical = 4.dp),
                ) {
                    Icon(
                        Icons.Default.Add,
                        contentDescription = "Add to cart",
                        modifier = Modifier.size(16.dp),
                    )
                }
            }
        }
    }
}
