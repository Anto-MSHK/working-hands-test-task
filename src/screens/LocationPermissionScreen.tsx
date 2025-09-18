import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
  Image,
} from 'react-native';
import { useGeolocation } from '../hooks/useGeolocation';

interface LocationPermissionScreenProps {
  onPermissionGranted: (coordinates: {
    latitude: number;
    longitude: number;
  }) => void;
}

export const LocationPermissionScreen: React.FC<
  LocationPermissionScreenProps
> = ({ onPermissionGranted }) => {
  const {
    coordinates,
    loading,
    error,
    permissionStatus,
    requestPermission,
    getCurrentLocation,
  } = useGeolocation();

  const [isRequesting, setIsRequesting] = useState(false);

  useEffect(() => {
    if (coordinates) {
      onPermissionGranted(coordinates);
    }
  }, [coordinates, onPermissionGranted]);

  useEffect(() => {
    if (permissionStatus === 'granted' && !coordinates && !loading) {
      getCurrentLocation();
    }
  }, [permissionStatus, coordinates, loading, getCurrentLocation]);

  const handleRequestPermission = async () => {
    setIsRequesting(true);
    try {
      const granted = await requestPermission();
      if (granted) {
        await getCurrentLocation();
      } else if (permissionStatus === 'blocked') {
        Alert.alert(
          'Permission Blocked',
          'Location permission has been blocked. Please enable it in your device settings to continue.',
          [{ text: 'OK' }],
        );
      }
    } catch (err) {
      Alert.alert(
        'Error',
        'Failed to request location permission. Please try again.',
        [{ text: 'OK' }],
      );
    } finally {
      setIsRequesting(false);
    }
  };

  const handleRetry = async () => {
    await getCurrentLocation();
  };

  if (loading || isRequesting) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Getting your location...</Text>
      </View>
    );
  }

  if (permissionStatus === 'denied' || permissionStatus === 'checking') {
    return (
      <View style={styles.container}>
        <View style={styles.iconContainer}>
          <Text style={styles.locationIcon}>📍</Text>
        </View>

        <Text style={styles.title}>Enable Location Services</Text>
        <Text style={styles.description}>
          The app needs your location to find part-time shifts near you.
        </Text>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleRequestPermission}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>Enable Location</Text>
        </TouchableOpacity>

        <Text style={styles.privacyText}>
          Your location data is only used to find nearby shifts and is never
          shared.
        </Text>
      </View>
    );
  }

  if (permissionStatus === 'blocked') {
    return (
      <View style={styles.container}>
        <View style={styles.iconContainer}>
          <Text style={styles.locationIcon}>🚫</Text>
        </View>

        <Text style={styles.title}>Location Access Blocked</Text>
        <Text style={styles.description}>
          Location permission has been blocked. Please enable it in your device
          settings to use this app.
        </Text>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleRequestPermission}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>Open Settings</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.iconContainer}>
          <Text style={styles.locationIcon}>⚠️</Text>
        </View>

        <Text style={styles.title}>Location Error</Text>
        <Text style={styles.description}>{error}</Text>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleRetry}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (permissionStatus === 'unavailable') {
    return (
      <View style={styles.container}>
        <View style={styles.iconContainer}>
          <Text style={styles.locationIcon}>📵</Text>
        </View>

        <Text style={styles.title}>Location Services Unavailable</Text>
        <Text style={styles.description}>
          Location services are not available on this device. Please ensure your
          device supports location services.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#007AFF" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 24,
  },
  iconContainer: {
    marginBottom: 32,
  },
  locationIcon: {
    fontSize: 64,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  primaryButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 12,
    marginBottom: 24,
    minWidth: 200,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  privacyText: {
    fontSize: 14,
    color: '#999999',
    textAlign: 'center',
    marginTop: 16,
    paddingHorizontal: 32,
    lineHeight: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666666',
  },
});
