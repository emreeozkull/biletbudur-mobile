import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    FlatList,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import EventCard from '../components/EventCard';
import Header from '../components/Header';
import PerformerItem from '../components/PerformerItem';
import PopularEventItem from '../components/PopularEventItem';
import { fetchEvents, fetchPerformers } from '../services/api';

const { width } = Dimensions.get('window');
const POPULAR_COUNT = 5;

const groupEventsByCategory = (events) => {
    const categories = {
        Featured: [],
        Concerts: [],
        Theatre: [],
    };
    events.forEach((event, index) => {
        if (index < 5) categories.Featured.push(event);
        else if (index < 10) categories.Concerts.push(event);
        else categories.Theatre.push(event);
    });
    return Object.entries(categories)
        .map(([name, events]) => ({ name, events }))
        .filter(category => category.events.length > 0);
};

const HomeScreen = () => {
  const [popularEvents, setPopularEvents] = useState([]);
  const [categorizedEvents, setCategorizedEvents] = useState([]);
  const [performers, setPerformers] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [loadingPerformers, setLoadingPerformers] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const loadData = async () => {
      setLoadingEvents(true);
      setLoadingPerformers(true);
      setError(null);
      try {
        const [eventsResult, performersResult] = await Promise.all([
            fetchEvents(),
            fetchPerformers()
        ]);

        const allEventsData = eventsResult;
        const popular = allEventsData.slice(0, POPULAR_COUNT);
        const remainingEvents = allEventsData.slice(POPULAR_COUNT);
        setPopularEvents(popular);
        const groupedData = groupEventsByCategory(remainingEvents);
        setCategorizedEvents(groupedData);
        setLoadingEvents(false);

        if (performersResult.success) {
            const fetchedPerformers = performersResult.data || [];
            console.log('[HomeScreen] Fetched Performers State:', fetchedPerformers);
            setPerformers(fetchedPerformers);
        } else {
            setError(performersResult.error || 'Failed to load performers.');
        }
        setLoadingPerformers(false);

      } catch (err) {
        console.error("Error loading home screen data:", err);
        setError('Failed to load data.');
        setLoadingEvents(false);
        setLoadingPerformers(false);
      }
    };
    loadData();
  }, []);

  const renderPopularItem = ({ item }) => <PopularEventItem event={item} />;
  const renderEventCard = ({ item }) => <EventCard event={item} />;
  
  const renderPerformerItem = ({ item }) => {
      console.log('[HomeScreen] Rendering PerformerItem for:', item);
      if (!item?.name) return null;
      const performerName = item.name;
      const encodedName = encodeURIComponent(performerName);
      const targetUrl = `/performer/${encodedName}`;
      console.log(`[HomeScreen] Navigating to: ${targetUrl}`);
      
      return (
          <PerformerItem 
              performer={item} 
              onPress={() => router.push(targetUrl)}
          />
      );
  };

  const renderPerformersContent = () => {
      if (loadingPerformers) {
          return <ActivityIndicator style={styles.loadingIndicator} size="small" color="#007AFF" />;
      }
      if (error && performers.length === 0) {
           return <Text style={styles.errorText}>{typeof error === 'string' ? error : 'Failed to load performers.'}</Text>;
      }
      if (performers.length === 0) {
          return <Text style={styles.placeholderText}>No performers found.</Text>;
      }
      return (
          <FlatList
              data={performers}
              renderItem={renderPerformerItem}
              keyExtractor={(item) => item.id || item.name}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalListContainer}
          />
      );
  };

  const isLoading = loadingEvents || loadingPerformers;

  return (
    <View style={styles.outerContainer}>
      <Header />
      {isLoading && !error ? (
        <ActivityIndicator size="large" color="#0000ff" style={styles.loader} />
      ) : error && popularEvents.length === 0 && performers.length === 0 ? (
        <Text style={styles.errorText}>{typeof error === 'string' ? error : 'Failed to load data.'}</Text>
      ) : (
        <ScrollView style={styles.scrollView}>
          {popularEvents.length > 0 && (
            <View style={styles.carouselContainer}>
              <FlatList
                data={popularEvents}
                renderItem={renderPopularItem}
                keyExtractor={(item) => `popular-${item.id}`}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.carouselListContainer}
                decelerationRate="fast"
                snapToInterval={width * 0.9}
                snapToAlignment="center"
              />
            </View>
          )}

          {categorizedEvents.map((category) => (
            <View key={category.name} style={styles.categorySection}>
              <Text style={styles.categoryTitle}>{category.name}</Text>
              <FlatList
                data={category.events}
                renderItem={renderEventCard}
                keyExtractor={(item) => item.id.toString()}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalListContainer}
              />
            </View>
          ))}

          <View style={styles.categorySection}>
            <Text style={styles.categoryTitle}>Performers</Text>
            {renderPerformersContent()} 
          </View>

        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#f4f4f4',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    textAlign: 'center',
    marginTop: 20,
    paddingHorizontal: 20,
    fontSize: 16,
    color: 'red',
  },
   carouselContainer: {
    height: 200,
    marginBottom: 20,
    paddingTop: 10,
    alignItems: 'center',
  },
  carouselListContainer: {
  },
   categorySection: {
    marginBottom: 20,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 15,
    marginBottom: 10,
  },
  horizontalListContainer: {
    paddingHorizontal: 15,
    paddingBottom: 10,
     paddingVertical: 5,
  },
  loadingIndicator: {
      marginVertical: 10,
      alignSelf: 'center',
  },
  placeholderText: {
      fontSize: 14,
      color: '#8A8A8E',
      fontStyle: 'italic',
      textAlign: 'center',
      padding: 20,
  },
});

export default HomeScreen; 