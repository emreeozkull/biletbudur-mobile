import React from 'react';
import { Dimensions, Image, StyleSheet, View } from 'react-native';

const { width } = Dimensions.get('window');
const CAROUSEL_ITEM_WIDTH = width * 0.9; // 90% of screen width
const CAROUSEL_ITEM_HEIGHT = 180; // Adjust height as needed
const IMAGE_BASE_URL = "https://django-s3-test1.s3.eu-central-1.amazonaws.com/";

const PopularEventItem = ({ event }) => {
  // Use main_img directly if it's a non-empty string
  const imageUrl = typeof event.main_img === 'string' && event.main_img
    ? event.main_img // Use the value directly
    : null;

  // console.log("[PopularEventItem] Event:", event.name, "Final URL:", imageUrl); // Updated log

  return (
    <View style={styles.container}>
      {imageUrl ? (
        <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="cover" />
      ) : (
        <View style={[styles.image, styles.imagePlaceholder]} /> // Placeholder if no image
      )}
      {/* Optional: Add event title overlay later if needed */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: CAROUSEL_ITEM_WIDTH,
    height: CAROUSEL_ITEM_HEIGHT,
    borderRadius: 8,
    overflow: 'hidden',
    // marginRight: 10, // Add margin if items shouldn't touch edge-to-edge when scrolling
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    backgroundColor: '#ccc',
  },
});

export default PopularEventItem; 