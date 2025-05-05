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
  // User state now holds an object or null
  const [user, setUser] = useState(null); // e.g., { email: '...', first_name: '...', ... }
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUserFromToken = async () => {
      try {
        const accessToken = await SecureStore.getItemAsync('accessToken');
        if (accessToken) {
          // --- Placeholder for fetching user details from token ---
          // In a real app, you would:
          // 1. Decode the accessToken to get user ID/email if possible (less secure)
          // OR (better):
          // 2. Call an API endpoint (e.g., /api/user/me) with the token
          //    to get the user details.
          // For now, we'll just store a placeholder object based on the token existing.
          // We don't have the email here, so it will be limited.
          console.log("[AuthProvider] Token found on load. Setting placeholder user.");
          setUser({ token: accessToken }); // Minimal user object indication
          // Ideally, fetch full details here and update setUser again.
        } else {
            console.log("[AuthProvider] No token found on load.");
        }
      } catch (e) {
        console.error("Failed to load token/user", e);
      } finally {
        setLoading(false);
      }
    };
    loadUserFromToken();
  }, []);

  useProtectedRoute(user, loading);

  const login = async (email, password) => {
    setLoading(true);
    const result = await AuthApi.loginUser({ email, password });
    setLoading(false);
    if (result.success) {
      // --- Placeholder for setting user details after login ---
      // Again, ideally fetch user details from an endpoint here.
      // For now, store a basic object.
      const loggedInUser = {
          token: result.data.access, // Keep the token if needed
          email: email, // We have the email from the login form
          // Add dummy names, replace when profile fetching is implemented
          first_name: 'Test',
          last_name: 'User'
      };
      setUser(loggedInUser);
      Alert.alert("Success", "Login successful!");
    } else {
      const errorMessage = result.error?.detail || result.error?.non_field_errors?.[0] || 'Invalid email or password.';
      Alert.alert("Login Failed", errorMessage);
    }
    return result;
  };

  const register = async (userData) => {
    setLoading(true);
    const nameParts = userData.name?.split(' ') || [];
    const apiData = {
        email: userData.email,
        password: userData.password,
        first_name: nameParts[0] || '',
        last_name: nameParts.slice(1).join(' ') || ''
    };
    const result = await AuthApi.registerUser(apiData);
    setLoading(false);
    if (result.success) {
      Alert.alert("Success", "Registration successful! Please login.");
      // Potentially use result.data if register returns user details
      // router.replace('/login'); // Already handled in RegisterScreen
    } else {
       let errorMessage = 'Registration failed. Please try again.';
      if (result.error) {
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
    const result = await AuthApi.logoutUser(); // Clears tokens
    if (result.success) {
      setUser(null); // Clear user state object
    } else {
      Alert.alert("Logout Failed", result.error || "Could not log out.");
    }
    setLoading(false);
    return result;
  };

  // Provide the user object in the context value
  const providerValue = { user, loading, login, register, logout };
  // console.log("[AuthProvider] Providing value:", providerValue ? { ...providerValue, user: !!providerValue.user } : null); // Log presence of user

  return (
    <AuthContext.Provider value={providerValue}>
      {children}
    </AuthContext.Provider>
  );
}; 