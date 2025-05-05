import { Ionicons } from '@expo/vector-icons'; // For search icon in input
import { Stack, useFocusEffect, useRouter } from 'expo-router'; // Import useRouter, useFocusEffect
import React, { useCallback, useRef, useState } from 'react'; // Import useRef, useCallback
import {
    ActivityIndicator,
    FlatList,
    ListRenderItemInfo // Import ListRenderItemInfo
    ,




    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

// Assume EventCard can be used for displaying results
import EventCard from '../src/components/EventCard';
// Import the actual search API function
import { searchEventsApi } from '../src/services/api';

// Assume an Event interface exists or define it
interface Event {
    id: string | number;
    main_img_url?: string | null;
    name: string | string[];
    venue_name?: string | string[];
    date?: string;
}

// Placeholder for API search function (needs to be implemented in api.js)
// import { searchEvents } from '../../src/services/api';

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false); // Track if a search has been performed
  const router = useRouter(); // Initialize router
  const searchInputRef = useRef<TextInput>(null); // Create ref for TextInput

  // --- Auto-focus logic ---
  useFocusEffect(
    useCallback(() => {
      // Focus the input when the screen comes into focus
      // console.log('Search screen focused, attempting to focus input.');
      // Add a slight delay to ensure the screen transition is complete
      const timer = setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100); 

      return () => {
        // Optional cleanup: Blur input when leaving the screen
        // console.log('Search screen blurred.');
        // searchInputRef.current?.blur();
        clearTimeout(timer); // Clear the timer if the effect cleans up before it fires
      }; 
    }, []) // Empty dependency array ensures this runs on every focus
  );
  // --- End Auto-focus logic ---

  const handleSearch = async () => {
    if (!query.trim()) return; // Don't search if query is empty

    console.log(`Searching for: ${query}`);
    setLoading(true);
    setError(null);
    setHasSearched(true);
    setResults([]); // Clear previous results

    try {
      // --- Use actual API call --- 
      const searchResults: Event[] = await searchEventsApi(query);
      console.log(`Received ${searchResults.length} search results.`);
      setResults(searchResults); 
      // --- End API call --- 
    } catch (err: any) {
      console.error("Search failed:", err);
      setError(`Search failed: ${err.message}`);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };
  
  // --- Navigation Handler (similar to other screens) ---
  const handleEventPress = (rawEventId: string | number) => {
    const eventIdString = String(rawEventId);
    // Use the same ID extraction logic if applicable to search results
    const uuidPart = eventIdString.split('_')[0]; 
    if (uuidPart) {
      router.push(`/event/${uuidPart}`);
    } else {
      // If IDs might not have underscores, navigate with the raw ID
      console.warn(`Could not extract UUID part from: ${rawEventId}, using raw ID.`);
      router.push(`/event/${eventIdString}`);
    }
  };
  // --- End Navigation Handler ---

  // Updated render function for vertical list
  const renderResultItem = ({ item }: ListRenderItemInfo<Event>) => (
    <TouchableOpacity 
        style={styles.listItemContainer} 
        onPress={() => handleEventPress(item.id)}
    >
      <EventCard event={item} layoutContext="grid" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Set a specific title for the search screen header */}
      <Stack.Screen options={{ title: 'Search Events' }} />

      <View style={styles.searchContainer}>
        <TextInput
          ref={searchInputRef} // Attach the ref here
          style={styles.input}
          placeholder="Search events, venues, performers..."
          placeholderTextColor="#999"
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={handleSearch} // Trigger search on keyboard submit
          returnKeyType="search"
        />
        <TouchableOpacity onPress={handleSearch} style={styles.searchButton}>
          <Ionicons name="search" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" style={styles.loader} />
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : hasSearched && results.length === 0 ? (
          <Text style={styles.noResultsText}>No results found for "{query}".</Text>
      ) : (
        <FlatList
          data={results}
          renderItem={renderResultItem}
          keyExtractor={(item, index) => `${item.id}-${index}`}
          contentContainerStyle={styles.listContainer}
          keyboardShouldPersistTaps="handled"
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f4f4',
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    fontSize: 16,
    marginRight: 10,
  },
  searchButton: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 8,
  },
  loader: {
    marginTop: 50,
  },
  errorText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: 'red',
    paddingHorizontal: 20,
  },
  noResultsText: {
      textAlign: 'center',
      marginTop: 50,
      fontSize: 16,
      color: '#555',
      paddingHorizontal: 20,
  },
  listContainer: {
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  listItemContainer: {
    marginBottom: 0,
    paddingHorizontal: 5,
  },
}); 