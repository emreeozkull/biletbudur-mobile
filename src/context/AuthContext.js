import { useRouter, useSegments } from "expo-router";
import * as SecureStore from 'expo-secure-store';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import * as AuthApi from '../services/authApi'; // Import our API service

const AuthContext = createContext(null);

// Custom hook to use the AuthContext
export function useAuth() {
  return useContext(AuthContext);
}

// Pass loading state to the hook
function useProtectedRoute(user, loading) {
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    // Return early if initial loading is not complete
    if (loading) {
        return;
    }

    const inAuthGroup = segments[0] === "(auth)";

    if (!user && !inAuthGroup) {
      router.replace("/login");
    } else if (user && inAuthGroup) {
      router.replace("/");
    }
    // Add loading to dependency array
  }, [user, segments, router, loading]);
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Store user token (or decoded info)
  const [loading, setLoading] = useState(true); // For initial token check

  useEffect(() => {
    // On app load, check if tokens exist
    const loadTokens = async () => {
      try {
        const accessToken = await SecureStore.getItemAsync('accessToken');
        // TODO: Optionally verify token validity here (e.g., decode, check expiry)
        if (accessToken) {
          setUser(accessToken); // Or set decoded user info
        }
      } catch (e) {
        console.error("Failed to load tokens", e);
      } finally {
        setLoading(false);
      }
    };
    loadTokens();
  }, []);

  // Pass loading state to the hook
  useProtectedRoute(user, loading);

  const login = async (email, password) => {
    setLoading(true);
    const result = await AuthApi.loginUser({ email, password });
    setLoading(false);
    if (result.success) {
      setUser(result.data.access); // Set user state with access token
      Alert.alert("Success", "Login successful!");
      // Navigation handled by useProtectedRoute
    } else {
      // Handle specific error messages from API if available
      const errorMessage = result.error?.detail || result.error?.non_field_errors?.[0] || 'Invalid email or password.';
      Alert.alert("Login Failed", errorMessage);
    }
    return result; // Return result for potential further handling in component
  };

  const register = async (userData) => {
    setLoading(true);
    // Ensure name is split into first_name and last_name if backend expects it
    const nameParts = userData.name?.split(' ') || [];
    const apiData = {
        email: userData.email,
        password: userData.password,
        first_name: nameParts[0] || '', // Handle cases with no space in name
        last_name: nameParts.slice(1).join(' ') || '' // Handle cases with multiple last names or no last name
    };

    const result = await AuthApi.registerUser(apiData);
    setLoading(false);
    if (result.success) {
      Alert.alert("Success", "Registration successful! Please login.");
      // Consider auto-login or redirect to login
    } else {
      // Handle specific error messages from API
      let errorMessage = 'Registration failed. Please try again.';
      if (result.error) {
        // Example: Extract specific field errors if backend provides them
        if (result.error.email) errorMessage = `Email: ${result.error.email[0]}`;
        else if (result.error.password) errorMessage = `Password: ${result.error.password[0]}`;
        else if (typeof result.error === 'string') errorMessage = result.error;
      }
      Alert.alert("Registration Failed", errorMessage);
    }
    return result;
  };

  const logout = async () => {
    setLoading(true);
    const result = await AuthApi.logoutUser();
    if (result.success) {
        setUser(null); // Clear user state
        // Navigation handled by useProtectedRoute
    } else {
        Alert.alert("Logout Failed", result.error || "Could not log out.");
    }
    setLoading(false);
    return result;
  };

  const providerValue = { user, loading, login, register, logout };
  console.log("[AuthProvider] Providing value:", providerValue ? Object.keys(providerValue) : null);

  return (
    <AuthContext.Provider value={providerValue}>
      {children}
    </AuthContext.Provider>
  );
}; 