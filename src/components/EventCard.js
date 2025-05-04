import React from 'react';
import { Dimensions, Image, StyleSheet, Text, View } from 'react-native';

const { width } = Dimensions.get('window');
// Make cards smaller for horizontal view
const CARD_WIDTH = width * 0.6; // 60% of screen width, adjust as needed
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
          year: 'numeric',
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
    backgroundColor: '#fff',
    borderRadius: 8,
    overflow: 'hidden',
    marginRight: CARD_MARGIN_RIGHT,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  image: {
    width: '100%',
    height: 150,
  },
  imagePlaceholder: {
    width: '100%',
    height: 150,
    backgroundColor: '#eee',
  },
  infoContainer: {
    padding: 10,
  },
  title: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  venue: {
    fontSize: 13,
    color: '#555',
    marginBottom: 6,
  },
  date: {
    fontSize: 12,
    color: '#777',
  },
});

export default EventCard; 