import { Link } from 'expo-router';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity } from 'react-native';

// Placeholder image - replace with actual performer images if available
const placeholderImage = require('@/assets/images/icon.png'); // Adjust path if needed, ensure icon.png exists or use another placeholder

const PerformerItem = ({ performer }) => {
  return (
    <Link href={`/performer/${performer.id}`} asChild>
      <TouchableOpacity style={styles.container}>
        <Image
          source={performer.imageUrl ? { uri: performer.imageUrl } : placeholderImage}
          style={styles.image}
        />
        <Text style={styles.name}>{performer.name}</Text>
      </TouchableOpacity>
    </Link>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginRight: 15,
    width: 80, // Fixed width for consistency
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 30, // Make it circular
    backgroundColor: '#eee',
    marginBottom: 5,
  },
  name: {
    fontSize: 12,
    textAlign: 'center',
  },
});

export default PerformerItem; 