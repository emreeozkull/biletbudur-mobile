import axios from 'axios';

const SOLR_URL = 'https://solr.biletbudur.tr/solr/events/select?indent=true&q.op=OR&q=*%3A*&rows=20';

export const fetchEvents = async () => {
  try {
    const response = await axios.get(SOLR_URL);
    // The actual event data is nested within response.data.response.docs
    if (response.data && response.data.response && response.data.response.docs) {
      return response.data.response.docs;
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