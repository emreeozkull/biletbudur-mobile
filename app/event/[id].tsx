import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// --- Define Interfaces based on API response ---
interface PriceInfo {
  [key: string]: number; // e.g., "Öğrenci": 30.0
}

interface PerformerInfo {
  name: string;
  img: string | null;
  description: string | null;
}

interface Event {
  id: string; // API uses string UUID
  name: string; // API uses string name
  date: string; // API provides ISO date string
  venue_name: string; // API uses string
  url?: string; // Event URL
  prices?: PriceInfo;
  main_img_url?: string | null; // Changed from main_img
  description?: string;
  status?: string;
  performers?: PerformerInfo[];
}
// --- End Interfaces ---

// --- Constants ---
const MAX_DESC_LINES = 5; // Number of lines to show initially
const MIN_CHARS_FOR_TRUNCATION = 150; // Approx char length to trigger 'See More'
// --------------- 

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDescExpanded, setIsDescExpanded] = useState(false); // State for description expansion
  const router = useRouter();

  useEffect(() => {
    if (!id) {
      setError("Event ID is missing.");
      setLoading(false);
      return;
    }

    const loadEventDetails = async () => {
      setLoading(true);
      setError(null);
      const apiUrl = `https://www.biletbudur.tr/scrape/api/get-event-detail/${id}/`;
      console.log(`Fetching event details from: ${apiUrl}`);
      try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const eventData: Event = await response.json();
        
        // Log the structure of the fetched data
        console.log("Fetched Event Data Structure:", JSON.stringify(eventData, null, 2));
        
        setEvent(eventData);

      } catch (err: any) {
        console.error("Failed to load event details:", err);
        setError(`Failed to load event details: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    loadEventDetails();
  }, [id]); // Reload if id changes

  // Set the header title dynamically using the fetched name
  const screenTitle = event ? event.name : "Event Details";

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" style={styles.centered} />;
  }

  if (error) {
    return <Text style={[styles.centered, styles.errorText]}>{error}</Text>;
  }

  if (!event) {
    return <Text style={styles.centered}>Event not found.</Text>;
  }
  
  // Format Date (reuse logic from HomeScreen or a util function)
  let formattedDate = 'Date TBC';
  if (event.date) {
    try {
      const dateObj = new Date(event.date);
      if (!isNaN(dateObj.getTime())) {
        formattedDate = dateObj.toLocaleString('en-US', {
          year: 'numeric', month: 'long', day: 'numeric',
          hour: 'numeric', minute: '2-digit', hour12: true,
        });
      }
    } catch (e) {
      console.error('Error parsing date:', event.date, e);
    }
  }
  
  // Directly use venue_name string
  const venueName = event.venue_name || 'Venue TBC';

  // --- Navigation Handler for Performer ---
  const handlePerformerPress = (performerName: string) => {
    // Encode the name to handle special characters in the URL path
    router.push(`/performer/${encodeURIComponent(performerName)}`);
  };
  // --- End Navigation Handler ---

  const toggleDescExpansion = () => {
    setIsDescExpanded(!isDescExpanded);
  };

  // Determine if the description is long enough to warrant a 'See More' button
  const showSeeMoreButton = event.description && event.description.length > MIN_CHARS_FOR_TRUNCATION;

  return (
    // Use ScrollView for potentially long content
    <ScrollView style={styles.container}>
      {/* Configure header dynamically */}
      <Stack.Screen options={{ title: screenTitle }} /> 
      
      {/* Display Event Image */}
      {event.main_img_url && (
        <Image source={{ uri: event.main_img_url }} style={styles.image} resizeMode="cover" />
      )}

      {/* Display basic event details */}
      <Text style={styles.title}>{event.name}</Text>
      <Text style={styles.venue}>{venueName}</Text>
      <Text style={styles.date}>{formattedDate}</Text>
      
      {/* --- Add Get Tickets Button --- */} 
      {event.url && (
        <TouchableOpacity 
          style={styles.button}
          onPress={() => Linking.openURL(event.url!)} // Use ! as we checked event.url exists
        >
          <Text style={styles.buttonText}>Get Your Tickets</Text>
        </TouchableOpacity>
      )}
      {/* --- End Get Tickets Button --- */}

      {/* Display Prices */}
      {event.prices && Object.keys(event.prices).length > 0 && (
        <View style={styles.priceSection}>
          <Text style={styles.sectionTitle}>Prices:</Text>
          {Object.entries(event.prices).map(([type, price]) => (
            <Text key={type} style={styles.priceText}>{type}: {price.toFixed(2)} TRY</Text>
          ))}
        </View>
      )}

      {/* --- Updated Description Section --- */}
      {event.description && (
        <View style={styles.descriptionSection}>
          <Text style={styles.sectionTitle}>Description:</Text>
          <Text 
            style={styles.description}
            numberOfLines={isDescExpanded ? undefined : MAX_DESC_LINES} // Control lines shown
          >
            {event.description}
          </Text>
          {showSeeMoreButton && (
            <TouchableOpacity onPress={toggleDescExpansion} style={styles.seeMoreButton}>
              <Text style={styles.seeMoreButtonText}>
                {isDescExpanded ? 'See Less' : 'See More'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}
      {/* --- End Updated Description Section --- */}

      {/* --- Updated Performers Section --- */}
      {event.performers && event.performers.length > 0 && (
        <View style={styles.performersSectionContainer}>
          <Text style={styles.sectionTitle}>Performers:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.performersScrollView}>
            {event.performers.map((performer, index) => (
              <TouchableOpacity 
                 key={index} 
                 style={styles.performerChip} 
                 onPress={() => handlePerformerPress(performer.name)}
              >
                {/* Optional: Add performer image here if available */}
                <Text style={styles.performerChipText}>{performer.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
      {/* --- End Updated Performers Section --- */}

      {/* Add more details like map, external link button, etc. later */}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // padding: 20, // Padding applied to inner content instead
    backgroundColor: '#fff',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
  },
  image: {
    width: '100%',
    height: 250, // Adjust height as needed
    marginBottom: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    paddingHorizontal: 20,
  },
  venue: {
    fontSize: 18,
    color: '#555',
    marginBottom: 8,
    paddingHorizontal: 20,
  },
  date: {
    fontSize: 16,
    color: '#777',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12, // Increased bottom margin for section title
    marginTop: 10,
    paddingHorizontal: 20,
  },
  priceSection: {
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  priceText: {
     fontSize: 16,
     marginBottom: 4,
     color: '#333',
  },
  descriptionSection: {
    marginBottom: 10, // Reduced margin below description text
    paddingHorizontal: 20,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
  seeMoreButton: {
    marginTop: 8, // Space above the button
    alignSelf: 'flex-start', // Align button to the left
  },
  seeMoreButtonText: {
    color: '#007bff', // Link color
    fontWeight: '600',
    fontSize: 15,
  },
  // --- Performer Styles Update ---
  performersSectionContainer: { // Renamed from performersSection
    marginBottom: 20,
    // Horizontal padding is handled by sectionTitle and ScrollView contentContainer
  },
  performersScrollView: {
    paddingHorizontal: 20, // Padding for the start/end of the scroll view
    paddingBottom: 10, // Padding below the chips
  },
  performerChip: {
    backgroundColor: '#e9ecef', // Light grey background for chip
    borderRadius: 16, // Rounded corners
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 8, // Spacing between chips
    // Add border if desired
    // borderWidth: 1,
    // borderColor: '#ced4da',
  },
  performerChipText: { // Style for text inside the chip
    fontSize: 14,
    color: '#495057', // Darker grey text
  },
  // Remove old performerLink style if no longer needed elsewhere
  /*
  performerLink: {
    fontSize: 16,
    marginBottom: 4,
    color: '#007bff', 
    textDecorationLine: 'underline', 
  }
  */
  // --- End Performer Styles Update ---
  button: {
    backgroundColor: '#007bff', // Example button color
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginHorizontal: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 