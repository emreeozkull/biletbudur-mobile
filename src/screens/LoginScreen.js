import { useRouter } from 'expo-router'; // Make sure useRouter is imported
import React, { useState } from 'react'; // Import useState
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity, // Import TouchableOpacity for custom button
    View,
} from 'react-native';
import { useAuth } from '../context/AuthContext'; // Import useAuth hook

const LoginScreen = () => {
  // Basic login form state (add state management later)
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false); // Loading state

  const authContextValue = useAuth(); // Get the raw context value first
  console.log("[LoginScreen] Received auth context value:", authContextValue);
  const { login } = authContextValue || {}; // Destructure safely

  const router = useRouter(); // Initialize router

  const handleLogin = async () => {
    console.log("[LoginScreen] Starting login process");
    console.log("[LoginScreen] Login function:", login);
    console.log("[LoginScreen] Email:", email);
    console.log("[LoginScreen] Password:", password);
    if (!login) {
        
        console.error("[LoginScreen] Login function is not available from context!");
        Alert.alert("Error", "Authentication service not ready.");
        return;
    }
    setIsLoading(true);
    await login(email, password); // Context handles success/error alert and state update
    setIsLoading(false);
    // Navigation is handled automatically by useProtectedRoute in AuthContext
  };

  const navigateToRegister = () => {
    router.push('/register'); // Navigate to the register route
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.screen}
    >
      <View style={styles.container}>
        <Text style={styles.title}>Welcome Back!</Text>
        <Text style={styles.subtitle}>Sign in to continue</Text>

        <TextInput
          style={styles.input}
          placeholder="Email Address"
          placeholderTextColor="#999"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          editable={!isLoading} // Disable input when loading
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#999"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          editable={!isLoading}
        />

        {/* Custom Button with Loading Indicator */}
        <TouchableOpacity
          style={[styles.loginButton, isLoading && styles.buttonDisabled]} // Style adjustments for loading
          onPress={handleLogin}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.loginButtonText}>Login</Text>
          )}
        </TouchableOpacity>

        {/* Placeholder for other links */}
        <View style={styles.linksContainer}>
          <TouchableOpacity onPress={() => console.log('Forgot password')} disabled={isLoading}>
            <Text style={styles.linkText}>Forgot Password?</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={navigateToRegister} disabled={isLoading}>
            <Text style={styles.linkText}>Don't have an account? Sign Up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F8F9FA', // Light background for the whole screen
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30, // More horizontal padding
  },
  title: {
    fontSize: 32, // Larger title
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 40, // More space below subtitle
  },
  input: {
    width: '100%',
    height: 50, // Slightly taller inputs
    backgroundColor: '#FFFFFF', // White background
    borderWidth: 1,
    borderColor: '#E0E0E0', // Lighter border
    borderRadius: 12, // More rounded corners
    paddingHorizontal: 20, // More horizontal padding inside input
    marginBottom: 18, // Increased spacing
    fontSize: 16,
    color: '#333',
  },
  loginButton: {
    width: '100%',
    paddingVertical: 15,
    backgroundColor: '#007AFF', // Example primary color (iOS Blue)
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10, // Space above button
    elevation: 2, // Subtle shadow (Android)
    shadowColor: '#000', // Shadow (iOS)
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  buttonDisabled: {
      backgroundColor: '#B0D7FF', // Lighter blue when disabled
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  linksContainer: {
    marginTop: 25,
    alignItems: 'center',
  },
  linkText: {
    color: '#007AFF', // Match button color
    fontSize: 14,
    marginTop: 10, // Space between links
  },
});

export default LoginScreen; 