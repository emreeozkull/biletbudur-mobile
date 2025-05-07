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
        if (error.response?.status === 401 || error.response?.status === 403) { // Check for 403 as well
            console.warn("Access token likely expired. Refresh needed.");
            return { success: false, error: 'Unauthorized', status: error.response.status };
        }
        return { success: false, error: error.response?.data || 'Failed to fetch past favorites' };
    }
};

// Fetch Favorite Performers (uses authenticated client)
export const fetchFavoritePerformers = async () => {
    try {
        const response = await apiClient.get('/scrape/api/get-favorite-performers/');
        return { success: true, data: response.data }; 
    } catch (error) {
        console.error('Fetch Favorite Performers API Error:', error.response?.status, error.response?.data || error.message);
        if (error.response?.status === 401 || error.response?.status === 403) {
            console.warn("Access token likely expired. Refresh needed.");
            return { success: false, error: 'Unauthorized', status: error.response.status };
        }
        return { success: false, error: error.response?.data || 'Failed to fetch favorite performers' };
    }
};

// --- NEW --- Add Performer to Favorites (uses authenticated client)
export const addFavoritePerformer = async (performerName) => {
    if (!performerName) return { success: false, error: 'Performer name is required' };
    
    const endpoint = `/scrape/api/add-favorite-perfomer/${performerName}`;
    const fullUrl = `${apiClient.defaults.baseURL}${endpoint}`;

    console.log(`[API] Attempting to add favorite performer: ${performerName}`);
    console.log(`[API] Request URL: GET ${fullUrl}`);

    try {
        // Endpoint: /scrape/api/add-favorite-performer/
        // Body contains { performer_id: name } // Note: user requirement was performer_id, implemented as performer_name
        const response = await apiClient.get(endpoint);
        console.log('[API] Add Favorite Performer Response Status:', response.status);
        console.log('[API] Add Favorite Performer Response Data:', response.data);
        // Assuming success if status is 2xx, response body might vary
        return { success: true, data: response.data }; 
    } catch (error) {
        console.error('[API] Add Favorite Performer API Error Details:');
        if (error.response) {
            // Log status, data, and headers if available
            console.error('[API] Error Status:', error.response.status);
            console.error('[API] Error Data:', error.response.data);
            console.error('[API] Error Headers:', error.response.headers);
        } else if (error.request) {
            // The request was made but no response was received
            console.error('[API] Error Request:', error.request);
        } else {
            // Something happened in setting up the request that triggered an Error
            console.error('[API] Error Message:', error.message);
        }
        console.error('[API] Full Error Object:', error);

        if (error.response?.status === 401 || error.response?.status === 403) {
            console.warn("Access token likely expired. Refresh needed.");
            return { success: false, error: 'Unauthorized', status: error.response.status };
        }
        // Handle potential specific errors, e.g., already favorited?
        return { success: false, error: error.response?.data || 'Failed to add favorite performer' };
    }
};

// --- NEW --- Refresh Token Function
// This uses the unauthenticated client because it doesn't need the (likely expired) access token
const refreshToken = async () => {
    console.log("[API] Attempting to refresh token...");
    try {
        const currentRefreshToken = await SecureStore.getItemAsync('refreshToken');
        if (!currentRefreshToken) {
            console.log("[API] No refresh token found.");
            return { success: false, error: 'No refresh token available' };
        }

        const response = await authApiClient.post('token/refresh/', {
            refresh: currentRefreshToken
        });

        const newAccessToken = response.data.access;
        if (newAccessToken) {
            console.log("[API] Token refreshed successfully.");
            await SecureStore.setItemAsync('accessToken', newAccessToken);
            // Note: Some backends might also issue a new refresh token here.
            // If so, you'd need to store response.data.refresh as well.
            return { success: true, accessToken: newAccessToken };
        } else {
            throw new Error("New access token not received");
        }
    } catch (error) {
        console.error("[API] Token refresh failed:", error.response?.data || error.message);
        // Clear tokens if refresh fails (likely refresh token expired)
        await SecureStore.deleteItemAsync('accessToken');
        await SecureStore.deleteItemAsync('refreshToken');
        return { success: false, error: error.response?.data || 'Refresh failed' };
    }
};

// Variable to prevent multiple concurrent refresh attempts
let isRefreshing = false;
// Array to hold requests waiting for token refresh
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

// Add Response Interceptor for handling token expiry
apiClient.interceptors.response.use(
    (response) => {
        // Any status code within 2xx range cause this function to trigger
        return response;
    },
    async (error) => {
        const originalRequest = error.config;
        // Check for 401/403 and specific error code if backend provides it
        const statusCode = error.response?.status;
        const errorDetail = error.response?.data?.detail; // For messages like "Authentication credentials were not provided."
        const errorCode = error.response?.data?.code; // e.g., "token_not_valid"

        // Avoid retry loops for token refresh requests themselves
        if (originalRequest.url === authApiClient.defaults.baseURL + 'token/refresh/') {
            return Promise.reject(error);
        }

        // Condition for attempting token refresh
        const shouldAttemptRefresh = !originalRequest._retry && (
            statusCode === 401 ||
            (statusCode === 403 && errorCode === 'token_not_valid') ||
            (statusCode === 403 && errorDetail === "Authentication credentials were not provided.")
        );

        if (shouldAttemptRefresh) {
            if (isRefreshing) {
                // If already refreshing, queue the request
                return new Promise(function(resolve, reject) {
                    failedQueue.push({resolve, reject});
                }).then(token => {
                    originalRequest.headers['Authorization'] = 'Bearer ' + token;
                    return apiClient(originalRequest);
                }).catch(err => {
                    return Promise.reject(err); // Propagate the error if refresh failed
                });
            }

            console.log("[Interceptor] Access token expired or invalid. Attempting refresh...");
            originalRequest._retry = true; // Mark request to prevent infinite retry loops
            isRefreshing = true;

            const refreshResult = await refreshToken();

            if (refreshResult.success) {
                console.log("[Interceptor] Token refreshed. Retrying original request...");
                isRefreshing = false;
                // Update the Authorization header for the waiting queue and the current request
                apiClient.defaults.headers.common['Authorization'] = 'Bearer ' + refreshResult.accessToken;
                originalRequest.headers['Authorization'] = 'Bearer ' + refreshResult.accessToken;
                processQueue(null, refreshResult.accessToken);
                return apiClient(originalRequest); // Retry the original request with the new token
            } else {
                console.log("[Interceptor] Token refresh failed. Clearing queue and rejecting.");
                isRefreshing = false;
                processQueue(refreshResult.error || new Error('Token refresh failed'), null);
                // Optionally trigger logout globally here
                // await logoutUser(); // This might cause issues if called from context
                // Need a way to signal logout to AuthContext
                return Promise.reject(refreshResult.error || error);
            }
        }

        // For other errors, just reject
        return Promise.reject(error);
    }
); 