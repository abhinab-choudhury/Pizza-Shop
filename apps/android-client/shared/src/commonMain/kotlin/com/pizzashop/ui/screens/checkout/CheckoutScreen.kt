package com.pizzashop.ui.screens.checkout

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import org.koin.compose.viewmodel.koinViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CheckoutScreen(
    onOrderPlaced: () -> Unit,
    onBack: () -> Unit,
    viewModel: CheckoutViewModel = koinViewModel(),
) {
    val uiState by viewModel.uiState.collectAsState()

    LaunchedEffect(uiState.orderPlaced) {
        if (uiState.orderPlaced) {
            onOrderPlaced()
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Checkout") },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.Default.ArrowBack, "Back")
                    }
                },
            )
        },
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(16.dp)
                .verticalScroll(rememberScrollState()),
        ) {
            // Delivery Address
            Text(
                text = "Delivery Address",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold,
            )
            Spacer(modifier = Modifier.height(8.dp))
            OutlinedTextField(
                value = uiState.deliveryAddress,
                onValueChange = viewModel::onAddressChange,
                label = { Text("Enter your delivery address") },
                modifier = Modifier.fillMaxWidth(),
                minLines = 2,
            )

            Spacer(modifier = Modifier.height(24.dp))

            // Payment Method
            Text(
                text = "Payment Method",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold,
            )
            Spacer(modifier = Modifier.height(8.dp))

            val paymentMethods = listOf(
                "cash" to "Cash on Delivery",
                "card" to "Credit/Debit Card",
                "upi" to "UPI",
            )

            paymentMethods.forEach { (value, label) ->
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 4.dp),
                    verticalAlignment = Alignment.CenterVertically,
                ) {
                    RadioButton(
                        selected = uiState.paymentMethod == value,
                        onClick = { viewModel.onPaymentMethodChange(value) },
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(text = label)
                }
            }

            Spacer(modifier = Modifier.height(24.dp))

            uiState.error?.let { error ->
                Text(
                    text = error,
                    color = MaterialTheme.colorScheme.error,
                    style = MaterialTheme.typography.bodySmall,
                )
                Spacer(modifier = Modifier.height(8.dp))
            }

            // Place Order Button
            Button(
                onClick = { viewModel.placeOrder(emptyList()) },
                modifier = Modifier.fillMaxWidth(),
                enabled = !uiState.isLoading && uiState.deliveryAddress.isNotBlank(),
            ) {
                if (uiState.isLoading) {
                    CircularProgressIndicator(
                        modifier = Modifier.size(20.dp),
                        strokeWidth = 2.dp,
                        color = MaterialTheme.colorScheme.onPrimary,
                    )
                } else {
                    Text("Place Order")
                }
            }
        }
    }
}
