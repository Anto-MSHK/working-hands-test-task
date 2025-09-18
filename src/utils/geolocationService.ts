import Geolocation from '@react-native-community/geolocation';
import { Platform } from 'react-native';
import {
  check,
  request,
  PERMISSIONS,
  RESULTS,
  Permission,
} from 'react-native-permissions';

// Types
export interface LocationCoordinates {
  latitude: number;
  longitude: number;
}

export interface LocationResult {
  success: boolean;
  coordinates?: LocationCoordinates;
  error?: string;
}

export interface DistanceResult {
  distance: number; // in kilometers
  unit: 'km' | 'm';
  formatted: string;
}

// Constants
const LOCATION_PERMISSION = Platform.select({
  ios: PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
  android: PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
}) as Permission;

const GEOLOCATION_OPTIONS = {
  enableHighAccuracy: true,
  timeout: 15000,
  maximumAge: 10000,
};

/**
 * Geolocation Service
 * Provides utilities for location-related operations
 */
class GeolocationService {
  /**
   * Check if location permission is granted
   */
  async hasLocationPermission(): Promise<boolean> {
    try {
      const result = await check(LOCATION_PERMISSION);
      return result === RESULTS.GRANTED;
    } catch (error) {
      console.error('Error checking location permission:', error);
      return false;
    }
  }

  /**
   * Request location permission
   */
  async requestLocationPermission(): Promise<boolean> {
    try {
      const result = await request(LOCATION_PERMISSION);
      return result === RESULTS.GRANTED;
    } catch (error) {
      console.error('Error requesting location permission:', error);
      return false;
    }
  }

  /**
   * Get current location as a promise
   */
  getCurrentLocation(): Promise<LocationResult> {
    return new Promise(async resolve => {
      // Check permission first
      const hasPermission = await this.hasLocationPermission();

      if (!hasPermission) {
        const granted = await this.requestLocationPermission();
        if (!granted) {
          resolve({
            success: false,
            error: 'Location permission denied',
          });
          return;
        }
      }

      // Get location
      Geolocation.getCurrentPosition(
        position => {
          resolve({
            success: true,
            coordinates: {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            },
          });
        },
        error => {
          let errorMessage = 'Failed to get location';

          switch (error.code) {
            case 1:
              errorMessage = 'Location permission denied';
              break;
            case 2:
              errorMessage = 'Location unavailable';
              break;
            case 3:
              errorMessage = 'Location request timed out';
              break;
            case 4:
              errorMessage = 'Google Play services not available';
              break;
            case 5:
              errorMessage = 'Location settings not satisfied';
              break;
          }

          resolve({
            success: false,
            error: errorMessage,
          });
        },
        GEOLOCATION_OPTIONS,
      );
    });
  }

  /**
   * Calculate distance between two coordinates using Haversine formula
   * @param coords1 First coordinate
   * @param coords2 Second coordinate
   * @returns Distance in kilometers
   */
  calculateDistance(
    coords1: LocationCoordinates,
    coords2: LocationCoordinates,
  ): DistanceResult {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRad(coords2.latitude - coords1.latitude);
    const dLon = this.toRad(coords2.longitude - coords1.longitude);

    const lat1 = this.toRad(coords1.latitude);
    const lat2 = this.toRad(coords2.latitude);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    // Return formatted result
    if (distance < 1) {
      return {
        distance: distance * 1000,
        unit: 'm',
        formatted: `${Math.round(distance * 1000)} m`,
      };
    } else {
      return {
        distance,
        unit: 'km',
        formatted: `${distance.toFixed(1)} km`,
      };
    }
  }

  /**
   * Convert degrees to radians
   */
  private toRad(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Format coordinates for display
   */
  formatCoordinates(coords: LocationCoordinates): string {
    return `${coords.latitude.toFixed(6)}, ${coords.longitude.toFixed(6)}`;
  }

  /**
   * Check if coordinates are valid
   */
  isValidCoordinates(coords: LocationCoordinates): boolean {
    return (
      coords.latitude >= -90 &&
      coords.latitude <= 90 &&
      coords.longitude >= -180 &&
      coords.longitude <= 180
    );
  }

  /**
   * Get location with retry logic
   */
  async getLocationWithRetry(maxRetries: number = 3): Promise<LocationResult> {
    let lastError: string | undefined;

    for (let i = 0; i < maxRetries; i++) {
      const result = await this.getCurrentLocation();

      if (result.success) {
        return result;
      }

      lastError = result.error;

      // Wait before retrying (exponential backoff)
      if (i < maxRetries - 1) {
        await new Promise<void>(resolve =>
          setTimeout(() => resolve(), Math.pow(2, i) * 1000),
        );
      }
    }

    return {
      success: false,
      error: lastError || 'Failed to get location after multiple attempts',
    };
  }

  /**
   * Create a Google Maps URL for given coordinates
   */
  getMapUrl(coords: LocationCoordinates): string {
    return `https://www.google.com/maps?q=${coords.latitude},${coords.longitude}`;
  }

  /**
   * Open native maps app with coordinates
   */
  openInMaps(coords: LocationCoordinates, label?: string) {
    const scheme = Platform.select({
      ios: 'maps:0,0?q=',
      android: 'geo:0,0?q=',
    });
    const latLng = `${coords.latitude},${coords.longitude}`;
    const url = Platform.select({
      ios: `${scheme}${label || 'Location'}@${latLng}`,
      android: `${scheme}${latLng}(${label || 'Location'})`,
    });

    if (url) {
      import('react-native').then(({ Linking }) => {
        Linking.openURL(url).catch(err =>
          console.error('Error opening maps:', err),
        );
      });
    }
  }
}

// Export singleton instance
export const geolocationService = new GeolocationService();

// Export utility functions for direct use
export const {
  hasLocationPermission,
  requestLocationPermission,
  getCurrentLocation,
  calculateDistance,
  formatCoordinates,
  isValidCoordinates,
  getLocationWithRetry,
  getMapUrl,
  openInMaps,
} = geolocationService;
