import { Stack, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, StyleSheet, Text, View } from 'react-native';

// Define Performer interface (could be shared)
interface PerformerDetails {
  name: string;
  img?: string | null;
  description?: string; 
  // Add more details if available from a dedicated API
}

export default function PerformerDetailScreen() {
  // Use 'name' as the parameter based on the file name [name].tsx
  const { name } = useLocalSearchParams<{ name: string }>(); 
  const [performer, setPerformer] = useState<PerformerDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const decodedName = name ? decodeURIComponent(name) : null;

  useEffect(() => {
    if (!decodedName) {
      setError("Performer name is missing.");
      setLoading(false);
      return;
    }

    const loadPerformerDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        // --- Placeholder for actual API call to fetch performer by name/ID ---
        console.log(`Fetching details for performer: ${decodedName}`);
        // const performerData = await fetchPerformerByName(decodedName); 
        
        // Mock data for now:
        const mockPerformerData: PerformerDetails = {
          name: decodedName,
          img: null, // Add a placeholder image URL if desired
          description: `Detailed information about ${decodedName} will be shown here. Currently using mock data.`,
        };
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
        setPerformer(mockPerformerData);
        // --- End Placeholder ---

      } catch (err: any) {
        console.error("Failed to load performer details:", err);
        setError(`Failed to load performer details: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    loadPerformerDetails();
  }, [decodedName]); // Reload if name changes

  // Set the header title dynamically
  const screenTitle = performer ? performer.name : "Performer Details";

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" style={styles.centered} />;
  }

  if (error) {
    return <Text style={[styles.centered, styles.errorText]}>{error}</Text>;
  }

  if (!performer) {
    return <Text style={styles.centered}>Performer not found.</Text>;
  }

  return (
    <View style={styles.container}>
      {/* Configure header dynamically */}
      <Stack.Screen options={{ title: screenTitle }} /> 
      
      {performer.img && (
        <Image source={{ uri: performer.img }} style={styles.image} resizeMode="contain" />
      )}
      <Text style={styles.name}>{performer.name}</Text>
      <Text style={styles.description}>{performer.description || 'No details available.'}</Text>
      {/* Add more details as needed */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
    alignItems: 'center', // Center content
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
  },
  image: {
    width: 150,
    height: 150,
    borderRadius: 75, // Make it circular
    marginBottom: 20,
    backgroundColor: '#eee', // Placeholder background
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    color: '#555',
  }
}); 