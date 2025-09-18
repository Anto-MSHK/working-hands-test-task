/**
 * Working Hands - Shift Finding App
 * React Native application for finding part-time shifts based on location
 *
 * @format
 */

import React, { useState } from 'react';
import { StatusBar, StyleSheet, Text, View, useColorScheme } from 'react-native';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { store } from './src/store/store';
import { LocationPermissionScreen } from './src/screens';

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
        <AppContent />
      </SafeAreaProvider>
    </Provider>
  );
}

function AppContent() {
  const safeAreaInsets = useSafeAreaInsets();
  const [hasLocationPermission, setHasLocationPermission] = useState(false);
  const [userCoordinates, setUserCoordinates] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  const handlePermissionGranted = (coordinates: {
    latitude: number;
    longitude: number;
  }) => {
    setUserCoordinates(coordinates);
    setHasLocationPermission(true);
    console.log('Location obtained:', coordinates);
  };

  if (!hasLocationPermission) {
    return (
      <View style={[styles.container, { paddingTop: safeAreaInsets.top }]}>
        <LocationPermissionScreen onPermissionGranted={handlePermissionGranted} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: safeAreaInsets.top }]}>
      <View style={styles.mainContent}>
        <Text style={styles.subtitle}>Location Obtained Successfully!</Text>
        
        {userCoordinates && (
          <View style={styles.coordinatesContainer}>
            <Text style={styles.coordinatesTitle}>Your Location:</Text>
            <Text style={styles.coordinates}>
              Latitude: {userCoordinates.latitude.toFixed(6)}
            </Text>
            <Text style={styles.coordinates}>
              Longitude: {userCoordinates.longitude.toFixed(6)}
            </Text>
          </View>
        )}
        
        <View style={styles.statusContainer}>
          <Text style={styles.statusDescription}>
            The app is now ready to fetch shifts based on your location.
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  mainContent: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 20,
    color: '#4CAF50',
    marginBottom: 32,
    fontWeight: '600',
  },
  coordinatesContainer: {
    backgroundColor: '#F5F5F5',
    padding: 20,
    borderRadius: 12,
    marginBottom: 32,
    width: '100%',
    maxWidth: 320,
  },
  coordinatesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666666',
    marginBottom: 12,
  },
  coordinates: {
    fontSize: 14,
    color: '#333333',
    marginBottom: 4,
    fontFamily: 'monospace',
  },
  statusContainer: {
    alignItems: 'center',
  },
  statusText: {
    fontSize: 16,
    color: '#4CAF50',
    marginBottom: 8,
  },
  statusDescription: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    marginTop: 12,
    paddingHorizontal: 32,
    lineHeight: 20,
  },
});

export default App;
