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
import { fetchEvents } from '../services/api';

const { width } = Dimensions.get('window');
const POPULAR_COUNT = 5;

// Dummy Performer Data (replace with actual data source later)
const dummyPerformers = [
  { id: '1', name: 'Artist A', imageUrl: null },
  { id: '2', name: 'Band B', imageUrl: null },
  { id: '3', name: 'Comedian C', imageUrl: null },
  { id: '4', name: 'DJ D', imageUrl: null },
  { id: '5', name: 'Singer E', imageUrl: null },
  { id: '6', name: 'Actor F', imageUrl: null },
];

// Function to group events into dummy categories
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const allEventsData = await fetchEvents();
        console.log(
          "Raw Fetched Events (first 3):",
          JSON.stringify(allEventsData.slice(0, 3), null, 2)
        );

        const popular = allEventsData.slice(0, POPULAR_COUNT);
        const remainingEvents = allEventsData.slice(POPULAR_COUNT);

        setPopularEvents(popular);
        const groupedData = groupEventsByCategory(remainingEvents);
        setCategorizedEvents(groupedData);
      } catch (err) {
        setError('Failed to load data.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const renderPopularItem = ({ item }) => <PopularEventItem event={item} />;
  const renderEventCard = ({ item }) => <EventCard event={item} />;
  const renderPerformerItem = ({ item }) => <PerformerItem performer={item} />;

  return (
    <View style={styles.outerContainer}>
      <Header />
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" style={styles.loader} />
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
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
            <FlatList
              data={dummyPerformers}
              renderItem={renderPerformerItem}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalListContainer}
            />
          </View>

        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: '#fff', // Keep header background consistent
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#f4f4f4', // Background for the scrollable area
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    flex: 1,
    textAlign: 'center',
    marginTop: 50,
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
  },
});

export default HomeScreen; 