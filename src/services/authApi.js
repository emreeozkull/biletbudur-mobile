import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// Replace with your actual backend base URL if it's different
const API_BASE_URL = 'https://www.biletbudur.tr/accounts/api/'; // Example: Adjust if your backend runs elsewhere

const authApiClient = axios.create({
  baseURL: `${API_BASE_URL}`,
  timeout: 5000, // 5 second timeout
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
});

// Function to register a new user
export const registerUser = async (userData) => {
  try {
    // README mentions email, password, password2, first_name, last_name
    // Ensure userData includes password2
    const response = await authApiClient.post('register/', {
        ...userData,
        password2: userData.password // Assuming password and password2 are the same
    });
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Registration API Error:', error.response?.data || error.message);
    return { success: false, error: error.response?.data || 'Registration failed' };
  }
};

// Function to log in and get tokens
export const loginUser = async (credentials) => {
  try {
    // README mentions email and password for token endpoint
    console.log("[loginUser] credentials:", credentials);
    const response = await authApiClient.post('token/', credentials);
    const { access, refresh } = response.data;

    // Securely store tokens
    await SecureStore.setItemAsync('accessToken', access);
    await SecureStore.setItemAsync('refreshToken', refresh);

    return { success: true, data: { access, refresh } };
  } catch (error) {
    console.error('Login API Error:', error.response?.data || error.message);
    await SecureStore.deleteItemAsync('accessToken'); // Clear any stale tokens on failure
    await SecureStore.deleteItemAsync('refreshToken');
    return { success: false, error: error.response?.data || 'Login failed' };
  }
};

// Function to log out (clear tokens)
export const logoutUser = async () => {
    try {
        await SecureStore.deleteItemAsync('accessToken');
        await SecureStore.deleteItemAsync('refreshToken');
        // Optional: Call a backend /logout endpoint if it exists to invalidate tokens server-side
        return { success: true };
    } catch (error) {
        console.error('Logout Error:', error);
        return { success: false, error: 'Logout failed' };
    }
};

// Add function for refreshing token later if needed
// export const refreshToken = async () => { ... }; 