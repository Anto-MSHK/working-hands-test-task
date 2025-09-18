import { useState, useEffect, useCallback } from 'react';
import Geolocation from '@react-native-community/geolocation';
import { Platform, Alert, Linking } from 'react-native';
import {
  check,
  request,
  PERMISSIONS,
  RESULTS,
  openSettings,
  Permission,
} from 'react-native-permissions';

interface LocationCoordinates {
  latitude: number;
  longitude: number;
}

interface GeolocationState {
  coordinates: LocationCoordinates | null;
  loading: boolean;
  error: string | null;
  permissionStatus:
    | 'granted'
    | 'denied'
    | 'blocked'
    | 'unavailable'
    | 'checking';
}

const LOCATION_PERMISSION = Platform.select({
  ios: PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
  android: PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
}) as Permission;

export const useGeolocation = () => {
  const [state, setState] = useState<GeolocationState>({
    coordinates: null,
    loading: false,
    error: null,
    permissionStatus: 'checking',
  });

  // Check permission status
  const checkPermission = useCallback(async () => {
    try {
      const result = await check(LOCATION_PERMISSION);

      switch (result) {
        case RESULTS.GRANTED:
          setState(prev => ({ ...prev, permissionStatus: 'granted' }));
          return true;
        case RESULTS.DENIED:
          setState(prev => ({ ...prev, permissionStatus: 'denied' }));
          return false;
        case RESULTS.BLOCKED:
          setState(prev => ({ ...prev, permissionStatus: 'blocked' }));
          return false;
        case RESULTS.UNAVAILABLE:
          setState(prev => ({
            ...prev,
            permissionStatus: 'unavailable',
            error: 'Location services are not available on this device',
          }));
          return false;
        default:
          return false;
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: 'Failed to check location permission',
      }));
      return false;
    }
  }, []);

  // Request permission
  const requestPermission = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const result = await request(LOCATION_PERMISSION);

      switch (result) {
        case RESULTS.GRANTED:
          setState(prev => ({
            ...prev,
            permissionStatus: 'granted',
            loading: false,
          }));
          return true;
        case RESULTS.DENIED:
          setState(prev => ({
            ...prev,
            permissionStatus: 'denied',
            loading: false,
            error: 'Location permission was denied',
          }));
          return false;
        case RESULTS.BLOCKED:
          setState(prev => ({
            ...prev,
            permissionStatus: 'blocked',
            loading: false,
            error:
              'Location permission is blocked. Please enable it in settings.',
          }));
          // Show alert to guide user to settings
          Alert.alert(
            'Location Permission Required',
            'This app needs location access to find shifts near you. Please enable location access in your device settings.',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Open Settings', onPress: () => openSettings() },
            ],
          );
          return false;
        case RESULTS.UNAVAILABLE:
          setState(prev => ({
            ...prev,
            permissionStatus: 'unavailable',
            loading: false,
            error: 'Location services are not available',
          }));
          return false;
        default:
          setState(prev => ({ ...prev, loading: false }));
          return false;
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to request location permission',
      }));
      return false;
    }
  }, []);

  // Get current location
  const getCurrentLocation = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    // Check if permission is granted
    const hasPermission = await checkPermission();

    if (!hasPermission) {
      // Try to request permission
      const permissionGranted = await requestPermission();
      if (!permissionGranted) {
        setState(prev => ({ ...prev, loading: false }));
        return;
      }
    }

    // Get location with high accuracy
    Geolocation.getCurrentPosition(
      position => {
        const coordinates: LocationCoordinates = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        setState(prev => ({
          ...prev,
          coordinates,
          loading: false,
          error: null,
        }));
      },
      error => {
        let errorMessage = 'Failed to get location';

        switch (error.code) {
          case 1: // PERMISSION_DENIED
            errorMessage = 'Location permission denied';
            break;
          case 2: // POSITION_UNAVAILABLE
            errorMessage = 'Location information is unavailable';
            break;
          case 3: // TIMEOUT
            errorMessage = 'Location request timed out';
            break;
          case 4: // PLAY_SERVICE_NOT_AVAILABLE (Android only)
            errorMessage = 'Google Play services are not available';
            break;
          case 5: // SETTINGS_NOT_SATISFIED (Android only)
            errorMessage = 'Location settings are not satisfied';
            if (Platform.OS === 'android') {
              Alert.alert(
                'Enable Location',
                'Please enable location services to use this feature.',
                [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Settings', onPress: () => Linking.openSettings() },
                ],
              );
            }
            break;
        }

        setState(prev => ({
          ...prev,
          loading: false,
          error: errorMessage,
        }));
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 10000,
      },
    );
  }, [checkPermission, requestPermission]);

  // Watch position (for continuous updates)
  const watchPosition = useCallback(() => {
    let watchId: number | null = null;

    const startWatching = async () => {
      // Check permission first
      const hasPermission = await checkPermission();

      if (!hasPermission) {
        const permissionGranted = await requestPermission();
        if (!permissionGranted) return null;
      }

      watchId = Geolocation.watchPosition(
        position => {
          const coordinates: LocationCoordinates = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          setState(prev => ({
            ...prev,
            coordinates,
            error: null,
          }));
        },
        error => {
          setState(prev => ({
            ...prev,
            error: `Location watch error: ${error.message}`,
          }));
        },
        {
          enableHighAccuracy: true,
          distanceFilter: 100, // Update every 100 meters
          interval: 10000, // Android only: Update every 10 seconds
          fastestInterval: 5000, // Android only: Fastest update interval
        },
      );

      return watchId;
    };

    startWatching();

    // Return cleanup function
    return () => {
      if (watchId !== null) {
        Geolocation.clearWatch(watchId);
      }
    };
  }, [checkPermission, requestPermission]);

  // Check initial permission status on mount
  useEffect(() => {
    checkPermission();
  }, [checkPermission]);

  return {
    coordinates: state.coordinates,
    loading: state.loading,
    error: state.error,
    permissionStatus: state.permissionStatus,
    requestPermission,
    getCurrentLocation,
    watchPosition,
    checkPermission,
  };
};
