import { Ionicons } from '@expo/vector-icons'; // Import icons
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react'; // Import useEffect, useState
import {
  ActivityIndicator,
  Alert, // Import Alert
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import FavoritePerformerItem from '../components/FavoritePerformerItem'; // Import the new component
import { useAuth } from '../context/AuthContext'; // Import useAuth hook
import {
  fetchFavoriteEvents,
  fetchFavoritePerformers,
  fetchPastFavoriteEvents
} from '../services/authApi'; // Import all needed API functions

// Reusable Card component for sections
const InfoCard = ({ title, iconName, children }) => (
  <View style={styles.card}>
    <View style={styles.cardHeader}>
      <Ionicons name={iconName} size={20} color="#007AFF" style={styles.cardIcon} />
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
    <View style={styles.cardContent}>
        {children}
    </View>
  </View>
);

const ProfileScreen = () => {
  const { user, logout, loading: authLoading } = useAuth(); // Rename auth loading
  const router = useRouter();

  // State for Saved Events
  const [savedEvents, setSavedEvents] = useState([]);
  const [savedEventsLoading, setSavedEventsLoading] = useState(true);
  const [savedEventsError, setSavedEventsError] = useState(null);

  // State for Past Saved Events
  const [pastEvents, setPastEvents] = useState([]);
  const [pastEventsLoading, setPastEventsLoading] = useState(true);
  const [pastEventsError, setPastEventsError] = useState(null);

  // --- NEW --- State for Favorite Performers
  const [favoritePerformers, setFavoritePerformers] = useState([]);
  const [favPerformersLoading, setFavPerformersLoading] = useState(true);
  const [favPerformersError, setFavPerformersError] = useState(null);

  // Fetch all data on mount
  useEffect(() => {
    const loadData = async () => {
      if (!user) return;

      // Set all loading states
      setSavedEventsLoading(true);
      setPastEventsLoading(true);
      setFavPerformersLoading(true);
      setSavedEventsError(null);
      setPastEventsError(null);
      setFavPerformersError(null);

      let sessionValid = true; // Flag to track if session expired during fetches

      const handleApiError = async (errorResult, setErrorFunc, itemName) => {
          setErrorFunc(errorResult.error || `Failed to load ${itemName}.`);
          if (errorResult.status === 401 || errorResult.status === 403) {
              sessionValid = false;
              Alert.alert("Session Expired", "Please log in again.");
              await logout();
          }
      };

      // Fetch all in parallel
      const [savedResult, pastResult, favPerformersResult] = await Promise.all([
          fetchFavoriteEvents(),
          fetchPastFavoriteEvents(),
          fetchFavoritePerformers()
      ]);

      // Process Saved Events
      if (savedResult.success) {
          setSavedEvents(savedResult.data || []);
      } else if (sessionValid) { // Only set error if session is still valid
          await handleApiError(savedResult, setSavedEventsError, 'saved events');
      }
      setSavedEventsLoading(false);
      if (!sessionValid) return; // Stop if logged out

      // Process Past Events
      if (pastResult.success) {
          setPastEvents(pastResult.data || []);
      } else if (sessionValid) {
          await handleApiError(pastResult, setPastEventsError, 'past events');
      }
      setPastEventsLoading(false);
      if (!sessionValid) return; // Stop if logged out
      
      // Process Favorite Performers
      if (favPerformersResult.success) {
          // Ensure API returns objects with at least id/name for keyExtractor/render
          setFavoritePerformers(favPerformersResult.data || []);
      } else if (sessionValid) {
          await handleApiError(favPerformersResult, setFavPerformersError, 'favorite performers');
      }
      setFavPerformersLoading(false);
    };

    loadData();
  }, [user]); // Refetch if user changes

  const handleLogout = async () => {
    await logout();
    // Navigation back to login is handled by AuthProvider
  };

  // --- Helper function to format date (similar to EventCard) ---
  const formatEventDate = (dateString) => {
    if (!dateString) return '';
    try {
      const dateObj = new Date(dateString);
      if (!isNaN(dateObj.getTime())) {
        return dateObj.toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        });
      }
    } catch (e) {
      console.error('Error parsing date in profile:', dateString, e);
    }
    return ''; // Return empty string on error or invalid date
  };

  if (authLoading || !user) {
    // Show loading indicator while auth state is resolving or if user is unexpectedly null
    return (
      <View style={[styles.screen, styles.centered]}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  // Extract user details safely
  const firstName = user?.first_name || '';
  const lastName = user?.last_name || '';
  const email = user?.email || 'user@example.com';
  const initials = (firstName?.[0] || '').toUpperCase();
  const fullName = `${firstName} ${lastName}`.trim() || 'User Name';

  // --- Render Function for Favorite Performer Item ---
  const renderFavoritePerformer = ({ item }) => { 
       // Expecting item to have at least `name` and `id` (or name as key fallback)
       // And potentially `image_url`
      if (!item?.name) return null;
      const performerName = item.name;
      const encodedName = encodeURIComponent(performerName);
      const targetUrl = `/performer/${encodedName}`;
      
       const handlePress = () => {
        console.log(`[Profile] User clicked performer, Navigating to: ${targetUrl}`); 
        router.push(targetUrl);
      };

      return (
          <FavoritePerformerItem 
              performer={item} // Pass the whole item
              onPress={handlePress} 
          />
      );
  };

  // --- Navigation Handler for Saved/Past Event --- 
  const handleSavedEventPress = (event) => {
      // Ensure event has id and needed fields for detail screen
      router.push({ 
          pathname: `/saved-event/${event.id}`, 
          params: { eventData: JSON.stringify(event) } 
      });
  };

  // --- Helper to render saved events content (loading/error/data) ---
  const renderSavedEventsContent = () => {
      if (savedEventsLoading) {
          return <ActivityIndicator style={styles.loadingIndicator} size="small" color="#007AFF" />;
      }
      if (savedEventsError) {
          return <Text style={styles.errorText}>{savedEventsError}</Text>;
      }
      if (savedEvents.length === 0) {
          return <Text style={styles.placeholderText}>No saved events.</Text>;
      }
      return savedEvents.map((event) => (
          <TouchableOpacity 
            key={`saved-${event.id}`} 
            style={styles.eventItemContainer} 
            onPress={() => handleSavedEventPress(event)}
          >
            <Text style={styles.listItem}>{event.name || 'Unnamed Event'}</Text> 
            <Text style={styles.listSubItem}>{formatEventDate(event.date)}</Text>
          </TouchableOpacity>
      ));
  };

  // --- Helper to render PAST saved events content (loading/error/data) ---
  const renderPastEventsContent = () => {
      if (pastEventsLoading) {
          return <ActivityIndicator style={styles.loadingIndicator} size="small" color="#007AFF" />;
      }
      if (pastEventsError) {
          return <Text style={styles.errorText}>{pastEventsError}</Text>;
      }
      if (pastEvents.length === 0) {
          return <Text style={styles.placeholderText}>No past saved events found.</Text>;
      }
      // Assuming past events have the same structure as saved events for the detail screen
      return pastEvents.map((event) => (
          <TouchableOpacity 
            key={`past-${event.id}`} 
            style={styles.eventItemContainer} 
            onPress={() => handleSavedEventPress(event)} // Use the same handler
          >
            <Text style={styles.listItem}>{event.name || 'Unnamed Event'}</Text> 
            <Text style={styles.listSubItem}>{formatEventDate(event.date)}</Text>
          </TouchableOpacity>
      ));
  };

  // --- NEW Helper to render Favorite Performers content ---
  const renderFavoritePerformersContent = () => {
      if (favPerformersLoading) {
          return <ActivityIndicator style={styles.loadingIndicator} size="small" color="#007AFF" />;
      }
      if (favPerformersError) {
          return <Text style={styles.errorText}>{favPerformersError}</Text>;
      }
      if (favoritePerformers.length === 0) {
          return <Text style={styles.placeholderText}>No favorite performers yet.</Text>;
      }
      return (
          <FlatList
            data={favoritePerformers}
            renderItem={renderFavoritePerformer}
            // Ensure performer object has a unique id or use name
            keyExtractor={(item) => String(item.id || item.name)}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalListContainer}
          />
      );
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.scrollContainer}>
      {/* Profile Header */}
      <View style={styles.profileHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <Text style={styles.userName}>{fullName}</Text>
        <Text style={styles.userEmail}>{email}</Text>
      </View>

      {/* Favorite Performers Section - Use render helper */}
      <InfoCard title="Favorite Performers" iconName="star-outline">
        {renderFavoritePerformersContent()}
      </InfoCard>

      {/* Saved Events Section - Use render helper */}
      <InfoCard title="Saved Events" iconName="bookmark-outline">
        {renderSavedEventsContent()}
      </InfoCard>

      {/* Past Saved Events Section - Use render helper */}
      <InfoCard title="Past Saved Events" iconName="time-outline">
        {renderPastEventsContent()}
      </InfoCard>

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} disabled={authLoading}>
        {authLoading ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <Text style={styles.logoutButtonText}>Logout</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F0F2F5', // Lighter grey background
  },
  scrollContainer: {
      paddingBottom: 40, // Ensure space at the bottom
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0F2F5', // Match screen background
  },
  profileHeader: {
    alignItems: 'center',
    paddingTop: 40, // More padding top
    paddingBottom: 25,
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 20, // Curved bottom edge
    borderBottomRightRadius: 20,
    marginBottom: 25,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  avatar: {
    width: 90, // Slightly larger avatar
    height: 90,
    borderRadius: 45,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    elevation: 4, // Avatar shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  avatarText: {
    fontSize: 40,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  userName: {
    fontSize: 24, // Larger name
    fontWeight: '600', // Bold but not heaviest
    color: '#1C1C1E', // Darker text
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: '#8A8A8E', // Medium grey for email
  },
  // Card styles
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginHorizontal: 15,
    marginBottom: 15,
    paddingHorizontal: 15,
    paddingVertical: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  cardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
      borderBottomWidth: 1,
      borderBottomColor: '#EFEFF4',
      paddingBottom: 8,
  },
  cardIcon: {
      marginRight: 10,
  },
  sectionTitle: {
    fontSize: 17, // Slightly smaller section titles inside cards
    fontWeight: '600',
    color: '#1C1C1E',
  },
  cardContent: {
      // Add paddingLeft for horizontal list starting point if needed
      // paddingLeft: 5, 
  },
  listItem: {
    fontSize: 15,
    color: '#3C3C43',
    // paddingVertical: 8, // Removed padding to handle in container
    flex: 1, // Allow event name to take available space
    marginRight: 10, // Space between name and date
  },
  listSubItem: {
      fontSize: 13,
      color: '#8A8A8E',
      textAlign: 'right',
  },
  eventItemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10, // Adjusted padding
    borderBottomWidth: 1,
    borderBottomColor: '#EFEFF4',
    // Remove margin/padding if it's the direct child of cardContent 
    // which already has padding.
  },
  placeholderText: {
    fontSize: 14,
    color: '#8A8A8E',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 10,
  },
  errorText: {
      fontSize: 14,
      color: '#FF3B30', // Error color
      textAlign: 'center',
      paddingVertical: 10,
  },
  loadingIndicator: {
      marginTop: 10,
      marginBottom: 10,
  },
  logoutButton: {
    marginHorizontal: 20,
    marginTop: 30, // More space above logout
    paddingVertical: 15,
    backgroundColor: '#FF3B30', // iOS destructive red
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  horizontalListContainer: {
      paddingVertical: 5, // Add some vertical padding for the list items
  },
});

export default ProfileScreen; 