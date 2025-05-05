import axios from 'axios';

const SOLR_URL = 'https://solr.biletbudur.tr/solr/events/select?indent=true&q.op=OR&q=*%3A*&rows=20';
const BILETBUDUR_URL = 'https://www.biletbudur.tr/scrape/api/get-all-events/';

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