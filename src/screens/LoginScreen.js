import { useRouter } from 'expo-router'; // Make sure useRouter is imported
import React from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity, // Import TouchableOpacity for custom button
    View
} from 'react-native';

const LoginScreen = () => {
  // Basic login form state (add state management later)
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const router = useRouter(); // Initialize router

  const handleLogin = () => {
    console.log('Login attempt with:', email, password);
    // TODO: Implement actual login logic (API call, validation)
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
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#999"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        {/* Custom Button */}
        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <Text style={styles.loginButtonText}>Login</Text>
        </TouchableOpacity>

        {/* Placeholder for other links */}
        <View style={styles.linksContainer}>
          <TouchableOpacity onPress={() => console.log('Forgot password')}>
            <Text style={styles.linkText}>Forgot Password?</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={navigateToRegister}>
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