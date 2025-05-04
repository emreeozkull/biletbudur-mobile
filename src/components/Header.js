import { Ionicons } from '@expo/vector-icons'; // Using Expo's vector icons
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const Header = () => {
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => console.log('Logo pressed')}>
        {/* Placeholder for Logo - Replace with actual Image component later */}
        <Text style={styles.logo}>Biletbudur</Text>
        {/* <Image source={require('../assets/logo.png')} style={styles.logoImage} /> */}
      </TouchableOpacity>
      <View style={styles.iconsContainer}>
        <TouchableOpacity onPress={() => console.log('Search pressed')} style={styles.iconButton}>
          <Ionicons name="search" size={24} color="black" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => console.log('Account pressed')} style={styles.iconButton}>
          <Ionicons name="person-circle-outline" size={24} color="black" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => console.log('Menu pressed')} style={styles.iconButton}>
          <Ionicons name="menu" size={24} color="black" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingTop: 40, // Adjust based on status bar height if needed
    paddingBottom: 10,
    backgroundColor: '#fff', // Or your desired header background color
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  logo: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  // logoImage: {
  //   width: 100, // Adjust size as needed
  //   height: 40, // Adjust size as needed
  //   resizeMode: 'contain',
  // },
  iconsContainer: {
    flexDirection: 'row',
  },
  iconButton: {
    marginLeft: 15,
  },
});

export default Header; 