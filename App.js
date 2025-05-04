import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet } from 'react-native';
// Removed import for HomeScreen as it's now handled by Expo Router

// This App component might not be strictly necessary if Expo Router 
// handles the entire app structure via the app/ directory.
// However, it can be used for global providers or other setup if needed.
export default function App() {
  // If using Expo Router, the main content is rendered via app/_layout.tsx
  // This SafeAreaView might conflict or be redundant.
  // Consider removing it or ensuring it doesn't wrap the Router's output.
  // For now, let's keep it minimal.
  return (
    <>
      {/* Render nothing here directly, let Expo Router handle the screens */}
      <StatusBar style="auto" />
    </>
  );
  // Previous implementation:
  // return (
  //   <SafeAreaView style={styles.container}>
  //     <HomeScreen />
  //     <StatusBar style="auto" />
  //   </SafeAreaView>
  // );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff', // Match Header background or set a base color
  },
}); 