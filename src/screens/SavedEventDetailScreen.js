import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams } from 'expo-router';
import React from 'react';
import {
    Dimensions,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';

const { width } = Dimensions.get('window');

// Helper function to format date (can be moved to a utils file)
const formatEventDate = (dateString) => {
  if (!dateString) return 'Date TBC';
  try {
    const dateObj = new Date(dateString);
    if (!isNaN(dateObj.getTime())) {
      return dateObj.toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    }
  } catch (e) {
    console.error('Error parsing date in detail:', dateString, e);
  }
  return 'Date TBC';
};

const SavedEventDetailScreen = () => {
  const params = useLocalSearchParams();
  let event = null;

  try {
    if (params.eventData && typeof params.eventData === 'string') {
      event = JSON.parse(params.eventData);
    }
  } catch (e) {
    console.error("Error parsing event data param:", e);
  }

  // Handle cases where event data is missing or invalid
  if (!event) {
    return (
      <View style={styles.containerCentered}>
        <Text style={styles.errorText}>Event data not found.</Text>
      </View>
    );
  }

  const imageUrl = event.main_img_url;
  const performersString = event.performers?.join(', ') || 'N/A';

  return (
    <ScrollView style={styles.container}>
      {/* Update the header title */}
      <Stack.Screen options={{ title: event.name || 'Event Details' }} />

      {/* Big Image */}
      {imageUrl ? (
        <Image source={{ uri: imageUrl }} style={styles.eventImage} resizeMode="cover" />
      ) : (
        <View style={[styles.eventImage, styles.imagePlaceholder]}>
          <Ionicons name="image-outline" size={60} color="#ccc" />
        </View>
      )}

      {/* Details Section */}
      <View style={styles.detailsContainer}>
        <Text style={styles.title}>{event.name}</Text>

        <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={18} color="#555" style={styles.icon} />
            <Text style={styles.infoText}>{event.venue_name || 'Venue TBC'}</Text>
        </View>

        <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={18} color="#555" style={styles.icon} />
            <Text style={styles.infoText}>{formatEventDate(event.date)}</Text>
        </View>

        <View style={styles.infoRow}>
            <Ionicons name="people-outline" size={18} color="#555" style={styles.icon} />
            <Text style={styles.infoText}>{performersString}</Text>
        </View>

        {/* Add more details here if available/needed */}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  containerCentered: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
  },
  errorText: {
      fontSize: 16,
      color: 'red',
  },
  eventImage: {
    width: '100%',
    height: width * 0.7, // Adjust aspect ratio as desired (e.g., 70% of width)
  },
  imagePlaceholder: {
    backgroundColor: '#EFEFF4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailsContainer: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 20,
  },
  infoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 15,
  },
  icon: {
      marginRight: 10,
  },
  infoText: {
    fontSize: 16,
    color: '#3C3C43',
    lineHeight: 22, // Improve readability
    flex: 1, // Allow text to wrap
  },
});

export default SavedEventDetailScreen; 