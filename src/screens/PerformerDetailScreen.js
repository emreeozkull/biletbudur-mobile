import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import EventCard from '../components/EventCard'; // Re-use the EventCard
import { useAuth } from '../context/AuthContext'; // To check if user is logged in
import { fetchEventsForPerformer, fetchPerformerDetails } from '../services/api';
import { addFavoritePerformer } from '../services/authApi';
const { width } = Dimensions.get('window');

const PerformerDetailScreen = () => {
  const { id: performerNameParam } = useLocalSearchParams(); // Get the name param
  // Decode the name if it was encoded in the URL
  const performerName = performerNameParam 
      ? decodeURIComponent(Array.isArray(performerNameParam) ? performerNameParam[0] : performerNameParam)
      : null;

  const { user } = useAuth(); // Get user state to enable/disable button
  const [performer, setPerformer] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false); // Track favorite status
  const [isUpdatingFavorite, setIsUpdatingFavorite] = useState(false); // Loading for fav action
  const router = useRouter(); // Initialize router

  useEffect(() => {
    // --- TODO: Fetch initial favorite status --- 
    // You might want to fetch if the performer is already a favorite
    // when the component loads, possibly as part of fetchPerformerDetails 
    // or a separate API call. Update setIsFavorite accordingly.
    // setIsFavorite(performerData.is_favorite);
    // ----
    
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
          // --- TODO: Set initial favorite status from detailsResult.data if available --- 
          // if (detailsResult.data.is_favorite !== undefined) {
          //    setIsFavorite(detailsResult.data.is_favorite);
          // }
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

  // --- Add/Remove Favorite Handler --- 
  const handleToggleFavorite = async () => {
    if (!user) {
        Alert.alert("Login Required", "Please log in to add favorites.", [
            { text: "OK", onPress: () => router.push('/login') }
        ]);
        return;
    }
    if (!performerName) return;

    setIsUpdatingFavorite(true);
    
    // --- TODO: Implement Remove Favorite API Call --- 
    // Currently only adding. You'll need a removeFavoritePerformer API function
    // and logic here to call the correct one based on `isFavorite` state.
    if (isFavorite) {
        Alert.alert("Info", "Remove favorite functionality not yet implemented.");
        // const result = await removeFavoritePerformer(performerName);
        // if (result.success) setIsFavorite(false);
        // else Alert.alert("Error", result.error || "Could not remove favorite.");
        setIsUpdatingFavorite(false); // Remove this line when implementing remove
        return; 
    }
    // --- End TODO ---

    const result = await addFavoritePerformer(performerName);
    if (result.success) {
        setIsFavorite(true); // Assume success means it's now a favorite
        Alert.alert("Success", `${performerName} added to favorites!`);
    } else {
        // Handle specific errors like 401/403 which might mean logout is needed
        if (result.status === 401 || result.status === 403) {
            Alert.alert("Session Expired", "Please log in again.");
            // Ideally, AuthContext handles global logout on refresh failure
            // router.replace('/login'); // Force redirect if context didn't handle it
        } else {
            Alert.alert("Error", result.error || "Could not add favorite.");
        }
    }
    setIsUpdatingFavorite(false);
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
      {/* Update header title and add favorite button */}
      <Stack.Screen 
        options={{ 
          title: performer?.name || 'Performer Details', 
          headerRight: () => (
            <TouchableOpacity onPress={handleToggleFavorite} disabled={isUpdatingFavorite || !user} style={styles.favButtonContainer}>
              {isUpdatingFavorite ? (
                <ActivityIndicator size="small" color="#FF3B30" />
              ) : (
                <Ionicons 
                  name={isFavorite ? "heart" : "heart-outline"} 
                  size={26} 
                  color={isFavorite ? "#FF3B30" : (user ? "#FF3B30" : "#ccc") } 
                />
              )}
            </TouchableOpacity>
          ),
        }}
      />

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
  favButtonContainer: {
      marginRight: 15,
      padding: 5, // Increase tappable area
  },
});

export default PerformerDetailScreen; 