import axios from 'axios';

const SOLR_URL = 'https://solr.biletbudur.tr/solr/events/select?indent=true&q.op=OR&q=*%3A*&rows=20';
const BILETBUDUR_URL = 'https://www.biletbudur.tr/scrape/api/get-all-events/';
const API_BASE_URL = 'https://www.biletbudur.tr/scrape/api';

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
