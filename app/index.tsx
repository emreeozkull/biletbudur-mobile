import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  ListRenderItemInfo,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';
// Adjust import paths relative to the app/ directory
import EventCard from '../src/components/EventCard';
import Header from '../src/components/Header';
import PerformerItem from '../src/components/PerformerItem';
import PopularEventItem from '../src/components/PopularEventItem';
import { fetchEvents } from '../src/services/api';

// --- Define Interfaces for State and Data ---
interface Event {
  id: string | number; // Assuming id can be string or number
  main_img?: string | null;
  name: string | string[];
  venue_name?: string | string[];
  date?: string;
  // Add other potential event properties if known
}

interface CategorizedEvents {
  name: string;
  events: Event[];
}

interface Performer {
  id: string;
  name: string;
  imageUrl: string | null;
}
// --- End Interfaces ---

const { width } = Dimensions.get('window');
const POPULAR_CAROUSEL_ITEM_WIDTH = width * 0.9;
const POPULAR_COUNT = 5;

// Dummy Performer Data (replace with actual data source later)
const dummyPerformers: Performer[] = [
  { id: '1', name: 'Artist A', imageUrl: null },
  { id: '2', name: 'Band B', imageUrl: null },
  { id: '3', name: 'Comedian C', imageUrl: null },
  { id: '4', name: 'DJ D', imageUrl: null },
  { id: '5', name: 'Singer E', imageUrl: null },
  { id: '6', name: 'Actor F', imageUrl: null },
];

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
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null); // Allow string errors
  const [currentPopularIndex, setCurrentPopularIndex] = useState<number>(0);

  // Type the FlatList ref
  const popularFlatListRef = useRef<FlatList<Event>>(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Assume fetchEvents returns Event[] or handle potential errors/typing
        const allEventsData: Event[] = await fetchEvents();
        // Keep console log if needed for debugging
        // console.log(
        //   "Raw Fetched Events (first 3):",
        //   JSON.stringify(allEventsData.slice(0, 3), null, 2)
        // );

        const popular = allEventsData.slice(0, POPULAR_COUNT);
        const remainingEvents = allEventsData.slice(POPULAR_COUNT);

        setPopularEvents(popular);
        const groupedData = groupEventsByCategory(remainingEvents);
        setCategorizedEvents(groupedData);
      } catch (err) {
        setError('Failed to load data.');
        console.error(err);
      } finally {
        setLoading(false);
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

  // Add type to renderItem props
  const renderPopularItem = ({ item }: ListRenderItemInfo<Event>) => <PopularEventItem event={item} />;
  const renderEventCard = ({ item }: ListRenderItemInfo<Event>) => <EventCard event={item} />;
  const renderPerformerItem = ({ item }: ListRenderItemInfo<Performer>) => <PerformerItem performer={item} />;

  // Use View instead of SafeAreaView as SafeArea is often handled by the layout
  return (
    <View style={styles.outerContainer}>
      <Header />
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" style={styles.loader} />
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
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
              <Text style={styles.categoryTitle}>{category.name}</Text>
              <FlatList
                data={category.events}
                renderItem={renderEventCard}
                keyExtractor={(item) => item.id.toString()} // Ensure key is a string
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalListContainer}
              />
            </View>
          ))}

          <View style={styles.categorySection}>
            <Text style={styles.categoryTitle}>Performers</Text>
            <FlatList
              data={dummyPerformers}
              renderItem={renderPerformerItem}
              keyExtractor={(item) => item.id} // Ensure key is unique
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalListContainer}
            />
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
  categoryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 15,
    marginBottom: 10,
  },
  horizontalListContainer: {
    paddingHorizontal: 15,
    paddingBottom: 10,
  },
});
