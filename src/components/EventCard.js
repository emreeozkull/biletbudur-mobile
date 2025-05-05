import React from 'react';
import { Dimensions, Image, StyleSheet, Text, View } from 'react-native';

const { width } = Dimensions.get('window');
// Original dimensions for horizontal scroll
const HORIZONTAL_CARD_WIDTH = width * 0.65;
const HORIZONTAL_CARD_MARGIN_RIGHT = 15;
const IMAGE_BASE_URL = "https://django-s3-test1.s3.eu-central-1.amazonaws.com/";

// Add layoutContext prop
const EventCard = ({ event, layoutContext = 'horizontal' }) => {
  // Use main_img_url (as per API structure)
  const imageUrl = typeof event.main_img_url === 'string' && event.main_img_url
    ? event.main_img_url
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
      if (!isNaN(dateObj.getTime())) { // Use getTime() for better validation
        formattedDate = dateObj.toLocaleString('en-US', {
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
  const eventName = Array.isArray(event.name) ? event.name[0] : (typeof event.name === 'string' ? event.name : 'Event Name TBC');

  // Determine card style based on context
  const cardStyle = layoutContext === 'grid' 
      ? styles.gridCard 
      : styles.horizontalCard;

  return (
    <View style={[styles.cardBase, cardStyle]}>
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
  // Base styles common to both layouts
  cardBase: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    marginBottom: 10, // Consistent bottom margin for grid/horizontal
  },
  // Styles specific to horizontal layout
  horizontalCard: {
    width: HORIZONTAL_CARD_WIDTH,
    marginRight: HORIZONTAL_CARD_MARGIN_RIGHT,
  },
  // Styles specific to grid layout
  gridCard: {
    width: '100%', // Take full width of its container (cardWrapper)
    // marginRight is removed, spacing handled by grid padding
  },
  image: {
    width: '100%',
    height: 160, // Keep fixed height for consistency
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  imagePlaceholder: {
    backgroundColor: '#E0E0E0',
  },
  infoContainer: {
    paddingVertical: 10, // Slightly reduced vertical padding
    paddingHorizontal: 10,
  },
  title: {
    fontSize: 15, // Adjusted for potentially smaller grid cards
    fontWeight: '600',
    color: '#111',
    marginBottom: 4,
  },
  venue: {
    fontSize: 13,
    color: '#444',
    marginBottom: 6,
  },
  date: {
    fontSize: 12,
    color: '#666',
  },
});

export default EventCard; 