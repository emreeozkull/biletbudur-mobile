import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
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
import { fetchEventsByCategory, fetchMoreEventsByCategory } from '../../src/services/api';

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

const PAGE_SIZE = 25; // Number of items per request

export default function CategoryDetailScreen() {
  const { categoryName: encodedCategoryName } = useLocalSearchParams<{ categoryName: string }>();
  const categoryName = encodedCategoryName ? decodeURIComponent(encodedCategoryName) : null;

  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [startIdx, setStartIdx] = useState(PAGE_SIZE);
  const [hasMore, setHasMore] = useState(true);
  const router = useRouter(); // Initialize router

  useEffect(() => {
    if (!categoryName) {
        setError("Category name is missing.");
        setLoading(false);
        return;
    }
    setLoading(true);
    setHasMore(true);
    setStartIdx(PAGE_SIZE);
    setEvents([]);
    setError(null);

    fetchEventsByCategory(categoryName)
      .then((initialEventsData) => {
        setEvents(initialEventsData || []);
        if (!initialEventsData || initialEventsData.length < PAGE_SIZE) {
          setHasMore(false);
        }
      })
      .catch((err: any) => {
        console.error(`Failed initial load for category ${categoryName}:`, err);
        setError(`Failed to load events: ${err.message}`);
      })
      .finally(() => {
        setLoading(false);
      });

  }, [categoryName]); // Reload if categoryName changes

  const handleLoadMore = useCallback(async () => {
    if (loadingMore || !hasMore || !categoryName) {
        console.log("Load more skipped:", { loadingMore, hasMore, categoryName });
        return;
    }

    console.log(`handleLoadMore triggered, fetching from index: ${startIdx}`);
    setLoadingMore(true);

    try {
      const moreEventsData = await fetchMoreEventsByCategory(categoryName, startIdx);
      if (moreEventsData && moreEventsData.length > 0) {
        setEvents(prevEvents => [...prevEvents, ...moreEventsData]);
        setStartIdx(prevIdx => prevIdx + PAGE_SIZE);
      } else {
        console.log("No more events returned, setting hasMore to false.");
        setHasMore(false);
      }
    } catch (err: any) {
      console.error(`Failed to load more events for category ${categoryName}:`, err);
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, hasMore, categoryName, startIdx]);

  // Set the header title dynamically
  const screenTitle = categoryName ? `${categoryName} Events` : "Category Events";

  if (loading && events.length === 0) {
    return (
      <View style={styles.container}> 
         <Stack.Screen options={{ title: screenTitle }} />
         <ActivityIndicator size="large" color="#0000ff" style={styles.centered} />
      </View>
    );
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

  // --- Footer Component --- 
  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footerLoadingContainer}>
        <ActivityIndicator size="small" color="#888" />
      </View>
    );
  };
  // --- End Footer Component --- 

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: screenTitle }} />
      
      <FlatList
        data={events}
        renderItem={renderEventCard}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        contentContainerStyle={styles.listContainer}
        numColumns={2}
        columnWrapperStyle={styles.row}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={2.5}
        ListFooterComponent={renderFooter}
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
  footerLoadingContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  }
});
