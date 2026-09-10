package com.pizzashop.ui.screens.login

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import org.koin.compose.viewmodel.koinViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun LoginScreen(
    onLoginSuccess: () -> Unit,
    viewModel: LoginViewModel = koinViewModel(),
) {
    val uiState by viewModel.uiState.collectAsState()

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        if (uiState.isRegisterMode) "Create Account"
                        else if (uiState.isOtpMode) {
                            if (uiState.otpSent) "Verify Code" else "Email OTP Login"
                        } else "Sign In"
                    )
                },
            )
        },
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(horizontal = 24.dp)
                .verticalScroll(rememberScrollState()),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center,
        ) {
            Text(
                text = "Pizza Shop",
                style = MaterialTheme.typography.headlineLarge,
                color = MaterialTheme.colorScheme.primary,
            )

            Spacer(modifier = Modifier.height(8.dp))

            Text(
                text = if (uiState.isRegisterMode) "Join us today"
                else if (uiState.isOtpMode) {
                    if (uiState.otpSent) "Enter the code sent to your email"
                    else "Sign in with an email OTP"
                } else "Welcome back!",
                style = MaterialTheme.typography.bodyLarge,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )

            Spacer(modifier = Modifier.height(32.dp))

            if (uiState.isOtpMode) {
                OtpSection(uiState, viewModel, onLoginSuccess)
            } else {
                EmailPasswordSection(uiState, viewModel, onLoginSuccess)
            }

            uiState.error?.let { error ->
                Spacer(modifier = Modifier.height(16.dp))
                Text(
                    text = error,
                    color = MaterialTheme.colorScheme.error,
                    style = MaterialTheme.typography.bodySmall,
                )
            }

            Spacer(modifier = Modifier.height(24.dp))

            if (!uiState.isOtpMode) {
                TextButton(
                    onClick = { viewModel.toggleOtpMode() },
                ) {
                    Text("Or sign in with email OTP")
                }
            } else {
                TextButton(
                    onClick = { viewModel.toggleOtpMode() },
                ) {
                    Text("Or sign in with password")
                }
            }

            Spacer(modifier = Modifier.height(8.dp))

            if (!uiState.isOtpMode) {
                TextButton(
                    onClick = { viewModel.toggleMode() },
                ) {
                    Text(
                        if (uiState.isRegisterMode) "Already have an account? Sign in"
                        else "Don't have an account? Create one",
                    )
                }
            }
        }
    }
}

@Composable
private fun EmailPasswordSection(
    uiState: LoginUiState,
    viewModel: LoginViewModel,
    onLoginSuccess: () -> Unit,
) {
    if (uiState.isRegisterMode) {
        OutlinedTextField(
            value = uiState.name,
            onValueChange = viewModel::onNameChange,
            label = { Text("Full Name") },
            modifier = Modifier.fillMaxWidth(),
            singleLine = true,
        )
        Spacer(modifier = Modifier.height(12.dp))
    }

    OutlinedTextField(
        value = uiState.email,
        onValueChange = viewModel::onEmailChange,
        label = { Text("Email") },
        modifier = Modifier.fillMaxWidth(),
        singleLine = true,
        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email),
    )

    Spacer(modifier = Modifier.height(12.dp))

    OutlinedTextField(
        value = uiState.password,
        onValueChange = viewModel::onPasswordChange,
        label = { Text("Password") },
        modifier = Modifier.fillMaxWidth(),
        singleLine = true,
        visualTransformation = PasswordVisualTransformation(),
        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password),
    )

    Spacer(modifier = Modifier.height(24.dp))

    Button(
        onClick = {
            if (uiState.isRegisterMode) viewModel.register(onLoginSuccess)
            else viewModel.login(onLoginSuccess)
        },
        modifier = Modifier.fillMaxWidth(),
        enabled = !uiState.isLoading,
    ) {
        if (uiState.isLoading) {
            CircularProgressIndicator(
                modifier = Modifier.size(20.dp),
                strokeWidth = 2.dp,
                color = MaterialTheme.colorScheme.onPrimary,
            )
        } else {
            Text(if (uiState.isRegisterMode) "Create Account" else "Sign In")
        }
    }
}

@Composable
private fun OtpSection(
    uiState: LoginUiState,
    viewModel: LoginViewModel,
    onLoginSuccess: () -> Unit,
) {
    if (!uiState.otpSent) {
        OutlinedTextField(
            value = uiState.email,
            onValueChange = viewModel::onEmailChange,
            label = { Text("Email") },
            placeholder = { Text("you@example.com") },
            modifier = Modifier.fillMaxWidth(),
            singleLine = true,
            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email),
        )

        Spacer(modifier = Modifier.height(16.dp))

        Button(
            onClick = viewModel::sendOtp,
            modifier = Modifier.fillMaxWidth(),
            enabled = !uiState.isLoading && uiState.email.isNotBlank(),
        ) {
            if (uiState.isLoading) {
                CircularProgressIndicator(
                    modifier = Modifier.size(20.dp),
                    strokeWidth = 2.dp,
                )
            } else {
                Text("Send OTP")
            }
        }
    } else {
        Text(
            text = "Enter the 6-digit code sent to your email",
            style = MaterialTheme.typography.bodyMedium,
            textAlign = TextAlign.Center,
        )

        Spacer(modifier = Modifier.height(12.dp))

        OutlinedTextField(
            value = uiState.otpCode,
            onValueChange = viewModel::onOtpCodeChange,
            label = { Text("OTP Code") },
            modifier = Modifier.fillMaxWidth(),
            singleLine = true,
            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
        )

        Spacer(modifier = Modifier.height(16.dp))

        Button(
            onClick = { viewModel.verifyOtp(onLoginSuccess) },
            modifier = Modifier.fillMaxWidth(),
            enabled = !uiState.isLoading && uiState.otpCode.length == 6,
        ) {
            Text("Verify OTP")
        }
    }
}
