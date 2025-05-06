import React from 'react';
import { StyleSheet } from 'react-native';
import PerformerDetailScreen from '../../src/screens/PerformerDetailScreen';

export default function PerformerDetailRoute() {
  return <PerformerDetailScreen />;
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