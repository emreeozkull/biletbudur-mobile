import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    ListRenderItemInfo,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import EventCard from '../../src/components/EventCard';
import { fetchEvents } from '../../src/services/api';

// Reuse or import the Event interface
interface Event {
  id: string | number; 
  main_img?: string | null;
  main_img_url?: string | null; // Include based on EventCard usage
  name: string | string[];
  venue_name?: string | string[];
  date?: string;
  description?: string;
}

export default function CategoryDetailScreen() {
  const { categoryName: encodedCategoryName } = useLocalSearchParams<{ categoryName: string }>();
  const categoryName = encodedCategoryName ? decodeURIComponent(encodedCategoryName) : null;

  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter(); // Initialize router

  useEffect(() => {
    if (!categoryName) {
        setError("Category name is missing.");
        setLoading(false);
        return;
    }

    const loadCategoryEvents = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch ALL events - API currently doesn't support category filtering
        console.log(`Fetching all events for category page: ${categoryName}`);
        const allEventsData: Event[] = await fetchEvents(); 
        
        // TODO: Implement client-side filtering if needed
        setEvents(allEventsData); 

      } catch (err: any) {
        console.error("Failed to load events for category:", err);
        setError(`Failed to load events: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    loadCategoryEvents();
  }, [categoryName]); // Reload if categoryName changes

  // Set the header title dynamically
  const screenTitle = categoryName ? `${categoryName} Events` : "Category Events";

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" style={styles.centered} />;
  }

  if (error) {
    return (
        <View style={styles.container}> 
            {/* Still set title even on error */}
            <Stack.Screen options={{ title: screenTitle }} />
            <Text style={[styles.centered, styles.errorText]}>{error}</Text>
        </View>
    );
  }

  if (events.length === 0) {
      return (
          <View style={styles.container}>
              <Stack.Screen options={{ title: screenTitle }} />
              <Text style={styles.centered}>No events found for this category.</Text>
          </View>
      );
  }
  
  // --- Navigation Handler ---
  const handleEventPress = (rawEventId: string | number) => {
    const eventIdString = String(rawEventId);
    const uuidPart = eventIdString.split('_')[0]; 
    if (uuidPart) {
      router.push(`/event/${uuidPart}`);
    } else {
      console.warn(`Could not extract valid ID part from: ${rawEventId}`);
    }
  };
  // --- End Navigation Handler ---

  const renderEventCard = ({ item }: ListRenderItemInfo<Event>) => (
    <View style={styles.cardWrapper}>
      <TouchableOpacity onPress={() => handleEventPress(item.id)}>
        {/* Pass layoutContext="grid" */}
        <EventCard event={item} layoutContext="grid" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: screenTitle }} />
      
      <FlatList
        data={events}
        renderItem={renderEventCard}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        numColumns={2}
        columnWrapperStyle={styles.row}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f4f4',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    textAlign: 'center',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
  },
  listContainer: {
    paddingHorizontal: 5, 
    paddingVertical: 10, 
  },
  row: {
    // No specific style needed here now as cardWrapper handles spacing
  },
  cardWrapper: {
     flex: 1 / 2,
     padding: 5, 
  },
});
