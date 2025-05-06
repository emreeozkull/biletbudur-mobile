import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Adjust props to include onPress
const PerformerItem = ({ performer, onPress }) => {
  // Placeholder image logic (adapt if API provides image_url)
  const initials = (performer.name?.[0] || '?').toUpperCase();
  const imageUrl = performer.image_url; // Use image_url if available

  return (
    // Add onPress to the TouchableOpacity
    <TouchableOpacity style={styles.container} onPress={onPress}>
      {imageUrl ? (
         <Image source={{ uri: imageUrl }} style={styles.avatar} />
      ) : (
         <View style={styles.avatar}>
             <Text style={styles.avatarText}>{initials}</Text>
         </View>
      )}
      <Text style={styles.name} numberOfLines={2}>{performer.name || 'Unknown'}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginRight: 15,
    width: 80, // Reverted to original width for consistency
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30, // Make it circular
    backgroundColor: '#eee', // Placeholder background
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
    overflow: 'hidden', // Ensure image respects border radius
  },
  avatarText: {
    color: '#555', // Darker text for light background
    fontSize: 24,
    fontWeight: '600',
  },
  name: {
    fontSize: 12,
    textAlign: 'center',
  },
});

export default PerformerItem; 