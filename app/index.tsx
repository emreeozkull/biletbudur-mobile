import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  ListRenderItemInfo,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
// Adjust import paths relative to the app/ directory
import { useRouter } from 'expo-router';
import EventCard from '../src/components/EventCard';
import Header from '../src/components/Header';
import PerformerItem from '../src/components/PerformerItem';
import PopularEventItem from '../src/components/PopularEventItem';
import { fetchEvents, fetchPerformers } from '../src/services/api';

// --- Define Interfaces for State and Data ---
interface Event {
  id: string | number; // Assuming id can be string or number
  main_img?: string | null;
  name: string | string[];
  venue_name?: string | string[];
  date?: string;
  description?: string;
  // Add other potential event properties if known
}

interface CategorizedEvents {
  name: string;
  events: Event[];
}

interface Performer {
  id: string | number; // Allow number if API might return it
  name: string;
  image_url?: string | null; // Use field name from your API (e.g., image_url)
}
// --- End Interfaces ---

const { width } = Dimensions.get('window');
const POPULAR_CAROUSEL_ITEM_WIDTH = width * 0.9;
const POPULAR_COUNT = 5;

// Function to group events into dummy categories
const groupEventsByCategory = (events: Event[]): CategorizedEvents[] => {
    // Explicitly type the categories object
    const categories: { [key: string]: Event[] } = {
        Featured: [],
        Concerts: [],
        Theatre: [],
    };
    events.forEach((event: Event, index: number) => { // Add types to params
        if (index < 5) categories.Featured.push(event);
        else if (index < 10) categories.Concerts.push(event);
        else categories.Theatre.push(event);
    });
    return Object.entries(categories)
        .map(([name, eventsList]) => ({ name, events: eventsList })) // Rename inner 'events' to avoid shadow
        .filter(category => category.events.length > 0);
};

// Rename component to match the file-based routing convention (e.g., Index or Page)
export default function Index() { 
  // Provide types for state variables
  const [popularEvents, setPopularEvents] = useState<Event[]>([]);
  const [categorizedEvents, setCategorizedEvents] = useState<CategorizedEvents[]>([]);
  const [performers, setPerformers] = useState<Performer[]>([]); // State for performers
  const [loadingEvents, setLoadingEvents] = useState<boolean>(true);
  const [loadingPerformers, setLoadingPerformers] = useState<boolean>(true); // Separate loading state
  const [error, setError] = useState<string | null>(null); // Allow string errors
  const [currentPopularIndex, setCurrentPopularIndex] = useState<number>(0);

  // Type the FlatList ref
  const popularFlatListRef = useRef<FlatList<Event>>(null);
  const router = useRouter();

  useEffect(() => {
    const loadData = async () => {
      setLoadingEvents(true);
      setLoadingPerformers(true);
      setError(null);
      try {
        // Fetch events and performers in parallel
        const [eventsResult, performersResult] = await Promise.all([
            fetchEvents(),
            fetchPerformers() // Fetch performers
        ]);

        // Process events
        const allEventsData: Event[] = eventsResult; // Assuming fetchEvents returns Event[]
        const popular = allEventsData.slice(0, POPULAR_COUNT);
        const remainingEvents = allEventsData.slice(POPULAR_COUNT);
        setPopularEvents(popular);
        const groupedData = groupEventsByCategory(remainingEvents);
        setCategorizedEvents(groupedData);
        setLoadingEvents(false);

        // Process performers
        if (performersResult.success) {
            console.log('[Index] Fetched Performers State:', performersResult.data);
            // Ensure data has id/name, adjust keyExtractor/render if needed
            setPerformers(performersResult.data || []); 
        } else {
            setError(performersResult.error || 'Failed to load performers.');
        }
        setLoadingPerformers(false);

      } catch (err: any) { // Type the catch error
        console.error("Error loading home screen data:", err);
        setError(err.message || 'Failed to load data.');
        setLoadingEvents(false);
        setLoadingPerformers(false);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (popularEvents.length > 1 && popularFlatListRef.current) {
      const intervalId = setInterval(() => {
        setCurrentPopularIndex(prevIndex => {
          const nextIndex = (prevIndex + 1) % popularEvents.length;
          // Use optional chaining safely
          popularFlatListRef.current?.scrollToIndex({
            index: nextIndex,
            animated: true,
          });
          return nextIndex;
        });
      }, 5000);

      // Cleanup interval on unmount
      return () => clearInterval(intervalId);
    }
  }, [popularEvents]); // Dependency array is correct

  // --- Navigation Handlers ---
  const handleEventPress = (rawEventId: string | number) => {
    const eventIdString = String(rawEventId);
    const uuidPart = eventIdString.split('_')[0];
    if (uuidPart) {
      router.push(`/event/${uuidPart}`);
    } else {
      console.warn(`Could not extract valid ID part from: ${rawEventId}`);
    }
  };

  const handleCategoryPress = (categoryName: string) => {
      router.push(`/category/${encodeURIComponent(categoryName)}`);
  };
  // --- End Navigation Handlers ---

  // Add type to renderItem props
  const renderPopularItem = ({ item }: ListRenderItemInfo<Event>) => (
    <TouchableOpacity onPress={() => handleEventPress(item.id)}>
      <PopularEventItem event={item} />
    </TouchableOpacity>
  );
  const renderEventCard = ({ item }: ListRenderItemInfo<Event>) => (
    <TouchableOpacity onPress={() => handleEventPress(item.id)}>
      <EventCard event={item} layoutContext="horizontal" />
    </TouchableOpacity>
  );
  
  // Updated renderPerformerItem with navigation
  const renderPerformerItem = ({ item }: ListRenderItemInfo<Performer>) => {
      // console.log('[Index] Rendering PerformerItem for:', item); // Optional: Keep for render debugging if needed
      if (!item?.name) return null; 
      const performerName = item.name;
      const encodedName = encodeURIComponent(performerName);
      const targetUrl = `/performer/${encodedName}`; 
      // Removed the log from here
      
      const handlePress = () => {
        // Log ONLY when pressed
        console.log(`[Index] User clicked, Navigating to: ${targetUrl}`); 
        router.push(targetUrl as any);
      };

      return (
          <PerformerItem 
              performer={item} 
              onPress={handlePress} // Use the new handler
          />
      );
  };

  // --- Helper to render performers list content ---
  const renderPerformersContent = () => {
      if (loadingPerformers) {
          return <ActivityIndicator style={styles.loadingIndicator} size="small" color="#007AFF" />;
      }
      // Check for specific performer error state if needed, or use generic error
      if (error && performers.length === 0) { 
           return <Text style={styles.errorText}>{typeof error === 'string' ? error : 'Failed to load performers.'}</Text>;
      }
      if (performers.length === 0) {
          return <Text style={styles.placeholderText}>No performers found.</Text>;
      }
      return (
          <FlatList
              data={performers}
              renderItem={renderPerformerItem}
              keyExtractor={(item) => String(item.id || item.name)} // Use ID if available, fallback to name
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalListContainer}
          />
      );
  };

  const isLoading = loadingEvents || loadingPerformers;

  // Use View instead of SafeAreaView as SafeArea is often handled by the layout
  return (
    <View style={styles.outerContainer}>
      <Header />
      {isLoading && !error ? (
        <ActivityIndicator size="large" color="#0000ff" style={styles.loader} />
      ) : error && popularEvents.length === 0 && performers.length === 0 ? (
        <Text style={styles.errorText}>{typeof error === 'string' ? error : 'Failed to load data.'}</Text>
      ) : (
        // Consider using ScrollView only if content might exceed screen height
        <ScrollView style={styles.scrollView}>
          {popularEvents.length > 0 && (
            <View style={styles.carouselContainer}>
              <FlatList
                ref={popularFlatListRef}
                data={popularEvents}
                renderItem={renderPopularItem}
                keyExtractor={(item) => `popular-${item.id}`}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.carouselListContainer}
                decelerationRate="fast"
                snapToInterval={POPULAR_CAROUSEL_ITEM_WIDTH}
                snapToAlignment="center"
              />
            </View>
          )}

          {categorizedEvents.map((category) => (
            <View key={category.name} style={styles.categorySection}>
              <View style={styles.categoryHeaderContainer}>
                <TouchableOpacity onPress={() => handleCategoryPress(category.name)}>
                  <Text style={styles.categoryTitle}>{category.name}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleCategoryPress(category.name)}>
                    <Text style={styles.seeMoreText}>See More</Text>
                </TouchableOpacity>
              </View>
              <FlatList
                data={category.events}
                renderItem={renderEventCard}
                keyExtractor={(item) => item.id.toString()}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalListContainer}
              />
            </View>
          ))}

          <View style={styles.categorySection}>
            <Text style={styles.categoryTitle}>Performers</Text>
            {renderPerformersContent()}
          </View>

        </ScrollView>
      )}
    </View>
  );
}

// Styles remain the same, just moved into this file
const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: '#fff', // Keep header background consistent
    paddingTop: 20, // Add padding to push content down from the top edge
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#f4f4f4', // Background for the scrollable area
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    flex: 1,
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: 'red',
  },
  carouselContainer: {
    height: 200,
    marginBottom: 20,
    paddingTop: 10,
    alignItems: 'center',
  },
  carouselListContainer: {
  },
  categorySection: {
    marginBottom: 20,
  },
  categoryHeaderContainer: {
      flexDirection: 'row', 
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 15, 
      marginBottom: 10,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  seeMoreText: {
      fontSize: 14,
      fontWeight: '600',
      color: '#007bff', // Link color
  },
  horizontalListContainer: {
    paddingHorizontal: 15,
    paddingBottom: 10,
  },
  loadingIndicator: {
      marginVertical: 10,
      alignSelf: 'center',
  },
  placeholderText: {
      fontSize: 14,
      color: '#8A8A8E',
      fontStyle: 'italic',
      textAlign: 'center',
      padding: 20,
  },
});
