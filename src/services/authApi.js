import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// Replace with your actual backend base URL if it's different
const API_BASE_URL = 'https://www.biletbudur.tr'; // Example: Adjust if your backend runs elsewhere

// --- Unauthenticated client (for login/register) ---
const authApiClient = axios.create({
  baseURL: `${API_BASE_URL}/accounts/api/`,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
});

// --- Authenticated client (for requests requiring login) ---
const apiClient = axios.create({
    baseURL: API_BASE_URL, // Use base URL for other endpoints
    timeout: 5000,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    }
});

// Interceptor to automatically add the JWT token to requests
apiClient.interceptors.request.use(
    async (config) => {
        const accessToken = await SecureStore.getItemAsync('accessToken');
        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// --- API Functions --- 

// Register (uses unauthenticated client)
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

// Login (uses unauthenticated client)
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

// Logout (no client needed, just clears storage)
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

// Fetch Favorite Events (uses authenticated client)
export const fetchFavoriteEvents = async () => {
    try {
        const response = await apiClient.get('/scrape/api/favorites/');
        return { success: true, data: response.data };
    } catch (error) {
        console.error('Fetch Favorites API Error:', error.response?.status, error.response?.data || error.message);
        if (error.response?.status === 401) {
            console.warn("Access token likely expired. Refresh needed.");
            return { success: false, error: 'Unauthorized', status: 401 };
        }
        return { success: false, error: error.response?.data || 'Failed to fetch favorites' };
    }
};

// Fetch Past Favorite Events (uses authenticated client)
export const fetchPastFavoriteEvents = async () => {
    try {
        // Endpoint based on user query: /scrape/api/past-favorites/
        const response = await apiClient.get('/scrape/api/past-favorites/');
        return { success: true, data: response.data };
    } catch (error) {
        console.error('Fetch Past Favorites API Error:', error.response?.status, error.response?.data || error.message);
        if (error.response?.status === 401) {
            console.warn("Access token likely expired. Refresh needed.");
            return { success: false, error: 'Unauthorized', status: 401 };
        }
        return { success: false, error: error.response?.data || 'Failed to fetch past favorites' };
    }
};

// Add function for refreshing token later if needed
// export const refreshToken = async () => { ... }; 