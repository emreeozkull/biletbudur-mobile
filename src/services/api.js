import axios from 'axios';

const SOLR_URL = 'https://solr.biletbudur.tr/solr/events/select?indent=true&q.op=OR&q=*%3A*&rows=20';
const BILETBUDUR_URL = 'https://www.biletbudur.tr/scrape/api/get-all-events/';
const API_BASE_URL = 'https://www.biletbudur.tr/scrape/api';

// Unauthenticated client for general data fetching
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: 5000,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    }
});

export const fetchEvents = async () => {
  try {
    const response = await axios.get(BILETBUDUR_URL);
    // The actual event data is nested within response.data.response.docs
    if (response.data && response.status === 200) {
      return response.data;
    } else {
      console.error('Unexpected API response structure:', response.data);
      return [];
    }
  } catch (error) {
    console.error('Error fetching events:', error);
    // It might be helpful to check error.response for more details if available
    if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
        console.error('Response headers:', error.response.headers);
    }
    return []; // Return empty array on error
  }
}; 

export const fetchEventsByCategory = async (categoryName) => {
  // Encode the category name in case it contains special characters
  const encodedCategoryName = encodeURIComponent(categoryName);
  const url = `${API_BASE_URL}/get-categories/${encodedCategoryName}/`;
  console.log('Fetching events from category URL:', url);
  try {
    const response = await axios.get(url);
    // Assuming the API returns the list of events directly or nested under a key
    // Adjust response.data access if necessary based on the actual API structure
    // e.g., if it returns { events: [...] }, use response.data.events
    // For now, assume it returns the array directly:
    return response.data;
  } catch (error) {
    console.error('Error fetching events by category:', error);
    return []; // Return empty array on error
  }
}; 
// --- New Function to fetch MORE events by category with pagination ---
export const fetchMoreEventsByCategory = async (categoryName, startIdx) => {
  const url = `${API_BASE_URL}/get-categories-more/`;
  const postData = {
    category: categoryName,
    start_idx: startIdx,
  };
  console.log(`Fetching MORE events from ${url} with data:`, postData);
  try {
    // Use POST method and send data in the request body
    const response = await axios.post(url, postData);
    // Assuming the API returns the list of events directly or nested under a key
    // Adjust response.data access if necessary based on the actual API structure
    // e.g., if it returns { events: [...] }, use response.data.events
    // Return the array of events (or an empty array if none found)
    return response.data || []; 
  } catch (error) {
    console.error(`Error fetching more events for category ${categoryName} at index ${startIdx}:`, error);
    // Check for specific error types if needed, e.g., 404 might mean no more data
    if (error.response && error.response.status === 404) {
      console.log("Received 404, assuming no more events.");
      return []; // Return empty array to signal no more events
    }
    throw error; // Re-throw other errors for the component to handle
  }
};
// --- End New Function ---

// --- New Function for searching events ---
export const searchEventsApi = async (query) => {
  // Encode the query parameter for safe inclusion in the URL
  const encodedQuery = encodeURIComponent(query);
  const url = `https://www.biletbudur.tr/api/get-search-results?q=${encodedQuery}`;
  console.log(`Searching events with URL: ${url}`);
  try {
    const response = await axios.get(url);
    // Assuming the API returns the list of events directly or nested under a key like 'results' or 'events'
    // Log the response to check the structure first
    console.log("Search API Response Data:", response.data);
    // Adjust response.data access if necessary based on the actual API structure
    // e.g., if it returns { results: [...] }, use response.data.results
    // For now, assume it returns the array directly:
    return response.data.result || []; 
  } catch (error) {
    console.error(`Error searching events for query "${query}":`, error);
    // Consider returning empty array or throwing error based on how you want to handle failures
    // Returning empty for now to avoid crashing the search page on error
    return []; 
  }
};
// --- End New Function ---

// ... placeholder fetchEventById ...

// --- NEW --- Fetch Performer Details
export const fetchPerformerDetails = async (performerId) => {
    if (!performerId) return { success: false, error: 'Performer ID is required' };
    try {
        // Assuming endpoint: /api/performers/{id}/
        const response = await apiClient.get(`/performers/${performerId}/`);
        return { success: true, data: response.data };
    } catch (error) {
        console.error(`Fetch Performer ${performerId} Details API Error:`, error.response?.status, error.response?.data || error.message);
        return { success: false, error: error.response?.data || 'Failed to fetch performer details' };
    }
};

// --- NEW --- Fetch Events for a specific Performer
export const fetchEventsForPerformer = async (performerName) => {
    if (!performerName) return { success: false, error: 'Performer name is required' };
    try {
        // Assuming endpoint needs URL encoded name: /api/events/?performer_name=...
        const encodedName = encodeURIComponent(performerName);
        const response = await apiClient.get(`/get-performer-events/${performerName}`);

        return { success: true, data: response.data }; 
    } catch (error) {
        //console.error(`Fetch Events for Performer ${performerName} API Error:`, error.response?.status, error.response?.data || error.message);
        console.error(`Fetch Events for Performer ${performerName} API Error `);
        return { success: false, error: error.response?.data || 'Failed to fetch events for performer' };
    }
};

// --- NEW --- Fetch List of Performers
export const fetchPerformers = async () => {
    const url = '/performers/'; // Relative path
    console.log('[API] Fetching performers from:', apiClient.defaults.baseURL + url);
    try {
        const response = await apiClient.get(url); // Use relative path
        console.log('[API] Fetched Performers Data:', response.data);
        return { success: true, data: response.data }; 
    } catch (error) {
        // Log more detailed error info
        console.error(
            '[API] Fetch Performers Error:', 
            error.response?.status, // Status code
            error.response?.data,   // Response body (if available)
            error.message           // General error message
        );
        return { success: false, error: error.response?.data || 'Failed to fetch performers' };
    }
};
