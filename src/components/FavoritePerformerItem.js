import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// This component displays a favorite performer in a circular format
const FavoritePerformerItem = ({ performer, onPress }) => {
  const initials = (performer.name?.[0] || '?').toUpperCase();

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      {/* Placeholder using initials */}
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{initials}</Text>
      </View>
      <Text style={styles.name} numberOfLines={2}>{performer.name || 'Unknown'}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginRight: 15,
    width: 70, // Slightly smaller width for profile list
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25, // Make it circular
    backgroundColor: '#007AFF', // Consistent placeholder color
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
    // Add a subtle border or shadow if desired
    // borderWidth: 1,
    // borderColor: '#ddd',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
  },
  name: {
    fontSize: 12,
    color: '#3C3C43',
    textAlign: 'center',
  },
});

export default FavoritePerformerItem; 