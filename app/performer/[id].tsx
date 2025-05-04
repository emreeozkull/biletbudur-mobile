import { Stack, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function PerformerDetailScreen() {
  const { id } = useLocalSearchParams(); // Get the id from the URL

  // TODO: Fetch actual performer details based on the id
  const performerName = `Performer ${id}`;

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: performerName }} />
      <Text style={styles.title}>Details for {performerName}</Text>
      {/* Add more performer details here */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
}); 