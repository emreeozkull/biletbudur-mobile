import React from 'react';
import { Dimensions, Image, StyleSheet, Text, View } from 'react-native';

const { width } = Dimensions.get('window');
// Make cards slightly wider
const CARD_WIDTH = width * 0.65; // 65% of screen width
const CARD_MARGIN_RIGHT = 15;
const IMAGE_BASE_URL = "https://django-s3-test1.s3.eu-central-1.amazonaws.com/";

const EventCard = ({ event }) => {
  // Use main_img directly if it's a non-empty string
  const imageUrl = typeof event.main_img === 'string' && event.main_img
    ? event.main_img // Use the value directly
    : null;

  // console.log("[EventCard] Event:", event.name, "Final URL:", imageUrl);

  // Extract Venue Name (handle array)
  const venueName = Array.isArray(event.venue_name) && event.venue_name.length > 0
    ? event.venue_name[0]
    : 'Venue TBC';

  // Format Date (handle potential invalid date string)
  let formattedDate = 'Date TBC';
  if (event.date) {
    try {
      const dateObj = new Date(event.date);
      if (!isNaN(dateObj)) { // Check if date is valid
        formattedDate = dateObj.toLocaleString('en-US', {
          // year: 'numeric', // Keep it concise for card view
          month: 'short',
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        });
      }
    } catch (e) {
      console.error('Error parsing date:', event.date, e);
    }
  }

  // Extract Event Name (handle array)
  const eventName = Array.isArray(event.name) && event.name.length > 0
      ? event.name[0]
      : 'Event Name TBC';

  return (
    <View style={styles.card}>
      {imageUrl ? (
        <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="cover" />
      ) : (
        <View style={[styles.image, styles.imagePlaceholder]} />
      )}
      <View style={styles.infoContainer}>
        <Text style={styles.title} numberOfLines={2}>{eventName}</Text>
        <Text style={styles.venue} numberOfLines={1}>{venueName}</Text>
        <Text style={styles.date}>{formattedDate}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    backgroundColor: '#FFFFFF', // Use pure white
    borderRadius: 12, // Slightly larger radius
    overflow: 'hidden',
    marginRight: CARD_MARGIN_RIGHT,
    elevation: 4, // Slightly increased elevation
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15, // Softer shadow
    shadowRadius: 4, // Softer shadow
    marginBottom: 5, // Add some bottom margin if needed
  },
  image: {
    width: '100%',
    height: 160, // Slightly taller image
    borderTopLeftRadius: 12, // Match card radius
    borderTopRightRadius: 12, // Match card radius
  },
  imagePlaceholder: {
    width: '100%',
    height: 160,
    backgroundColor: '#E0E0E0', // Lighter placeholder
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  infoContainer: {
    paddingVertical: 12, // More vertical padding
    paddingHorizontal: 10,
    // backgroundColor: '#f9f9f9', // Optional subtle background
  },
  title: {
    fontSize: 16, // Slightly larger title
    fontWeight: '600', // Semi-bold
    color: '#111', // Darker title color
    marginBottom: 5,
  },
  venue: {
    fontSize: 14, // Slightly larger venue text
    color: '#444', // Slightly darker grey
    marginBottom: 8, // More space before date
  },
  date: {
    fontSize: 13, // Slightly larger date text
    color: '#666', // Medium grey
  },
});

export default EventCard; 