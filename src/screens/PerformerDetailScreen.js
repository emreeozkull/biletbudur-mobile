import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import EventCard from '../components/EventCard'; // Re-use the EventCard
import { fetchEventsForPerformer, fetchPerformerDetails } from '../services/api';

const { width } = Dimensions.get('window');

const PerformerDetailScreen = () => {
  const { id: performerNameParam } = useLocalSearchParams(); // Get the name param
  // Decode the name if it was encoded in the URL
  const performerName = performerNameParam 
      ? decodeURIComponent(Array.isArray(performerNameParam) ? performerNameParam[0] : performerNameParam)
      : null;

  const [performer, setPerformer] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter(); // Initialize router

  useEffect(() => {
    const loadData = async () => {
      if (!performerName) { // Check decoded name
        setError('Performer name not found.');
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        // Fetch performer details and events in parallel
        const [detailsResult, eventsResult] = await Promise.all([
          fetchPerformerDetails(performerName),
          fetchEventsForPerformer(performerName)
        ]);

        if (detailsResult.success) {
          setPerformer(detailsResult.data);
        } else {
          setError(detailsResult.error || 'Failed to load performer details.');
          // Optional: Set performer name from somewhere else if possible
        }

        if (eventsResult.success) {
          setEvents(eventsResult.data || []);
        } else {
          // Don't overwrite details error if it occurred
          if (!error) setError(eventsResult.error || 'Failed to load events.');
        }

      } catch (err) {
        console.error("Error loading performer page data:", err);
        setError('An unexpected error occurred.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [performerName]); // Depend on decoded name

  // Determine image URL (assuming backend provides `image_url` or similar)
  const imageUrl = performer?.image_url; // Adjust field name based on your API

  // --- Navigation Handler for Event Card --- 
  const handleEventPress = (rawEventId) => {
    // Assuming the event ID might be like 'uuid_timestamp', extract UUID part
    const eventIdString = String(rawEventId);
    const uuidPart = eventIdString.split('_')[0]; 
    if (uuidPart) {
      console.log(`[PerformerDetail] Navigating to event: /event/${uuidPart}`);
      router.push(`/event/${uuidPart}`);
    } else {
      console.warn(`[PerformerDetail] Could not extract valid ID part from: ${rawEventId}`);
      // Fallback or show error if needed
    }
  };

  if (loading) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (error && !performer) { // Show error prominently if performer details failed
    return (
      <View style={styles.centeredContainer}>
        <Text style={styles.errorText}>{typeof error === 'string' ? error : 'Failed to load performer.'}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Update header title dynamically */}
      <Stack.Screen options={{ title: performer?.name || 'Performer Details' }} />

      {/* Performer Header */} 
      <View style={styles.headerContainer}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.performerImage} resizeMode="cover" />
        ) : (
          <View style={[styles.performerImage, styles.imagePlaceholder]}>
            <Ionicons name="person-outline" size={80} color="#ccc" />
          </View>
        )}
        <Text style={styles.performerName}>{performer?.name || 'Performer Name'}</Text>
        {/* Add other performer details like bio here if available */} 
      </View>

      {/* Upcoming Events Section */} 
      <View style={styles.eventsSection}>
        <Text style={styles.sectionTitle}>Upcoming Events</Text>
        {error && <Text style={styles.errorText}>{typeof error === 'string' ? error : 'Failed to load events.'}</Text>} 
        {!error && events.length === 0 && !loading && (
          <Text style={styles.placeholderText}>No upcoming events found for this performer.</Text>
        )}
        {!error && events.length > 0 && (
           <View style={styles.eventListContainer}>
             {events.map((event) => (
               // Wrap EventCard with TouchableOpacity
               <TouchableOpacity 
                 key={event.id} 
                 onPress={() => handleEventPress(event.id)} // Add onPress handler
               >
                 <View style={styles.eventCardWrapper}>
                      <EventCard event={event} layoutContext="grid" /> 
                 </View>
               </TouchableOpacity>
             ))}
           </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F2F5', // Light background
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F0F2F5',
  },
  errorText: {
    fontSize: 16,
    color: '#FF3B30',
    textAlign: 'center',
  },
  headerContainer: {
    alignItems: 'center',
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
    marginBottom: 15, 
  },
  performerImage: {
    width: '100%',
    height: width * 0.8, // Large image, adjust ratio as needed
    marginBottom: 15,
  },
  imagePlaceholder: {
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  performerName: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1C1C1E',
    textAlign: 'center',
    paddingHorizontal: 15,
  },
  eventsSection: {
    paddingHorizontal: 5, // Less horizontal padding for grid-like layout
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 15,
    marginLeft: 10, // Align with card padding
  },
  eventListContainer: {
    // Styles for the view wrapping the mapped event cards
    // Could use flexDirection: 'row', flexWrap: 'wrap' for a true grid
    // But mapping directly often works well for simpler lists
  },
  eventCardWrapper: {
    marginBottom: 15, // Add space between vertical cards
    paddingHorizontal: 10, // Padding around each card if needed
  },
  placeholderText: {
    fontSize: 14,
    color: '#8A8A8E',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 20,
  },
});

export default PerformerDetailScreen; 