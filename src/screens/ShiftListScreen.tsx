import React, { useEffect, useCallback } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Text,
  RefreshControl,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useAppSelector, useAppDispatch } from '../store/store';
import { fetchShifts, clearError } from '../store/shiftsSlice';
import { geolocationService } from '../utils/geolocationService';
import { Shift } from '../types';
import ShiftListItem from '../components/ShiftListItem';

type RootStackParamList = {
  ShiftList: undefined;
  ShiftDetail: { shift: Shift };
};

type ShiftListScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'ShiftList'
>;

const ShiftListScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigation = useNavigation<ShiftListScreenNavigationProp>();
  const {
    data: shifts,
    loading,
    error,
  } = useAppSelector(state => state.shifts);

  const safeShifts = Array.isArray(shifts) ? shifts : [];

  const loadShifts = useCallback(
    async (forceRefresh: boolean = false) => {
      try {
        dispatch(clearError());

        // For refresh, we need to get fresh coordinates
        const locationResult = forceRefresh
          ? await geolocationService.getCurrentLocation()
          : await geolocationService.getLocationWithRetry(3);

        if (!locationResult.success || !locationResult.coordinates) {
          console.error('Location request failed:', locationResult.error);
          Alert.alert(
            'Location Error',
            locationResult.error ||
              'Could not get your location. Please check location permissions and try again.',
            [{ text: 'OK' }],
          );
          return;
        }

        dispatch(fetchShifts(locationResult.coordinates));
      } catch (error) {
        console.error('Error in loadShifts:', error);
        Alert.alert('Error', 'Failed to load shifts. Please try again.', [
          { text: 'OK' },
        ]);
      }
    },
    [dispatch],
  );

  useEffect(() => {
    loadShifts(false);
  }, [loadShifts]);

  const handleShiftPress = useCallback(
    (shift: Shift) => {
      console.log('Selected shift:', shift.id);
      navigation.navigate('ShiftDetail', { shift });
    },
    [navigation],
  );

  const renderShiftItem = useCallback(
    ({ item }: { item: Shift }) => (
      <ShiftListItem shift={item} onPress={handleShiftPress} />
    ),
    [handleShiftPress],
  );

  const keyExtractor = useCallback((item: Shift) => item.id, []);

  const renderHeader = useCallback(() => {
    if (safeShifts.length === 0 && !loading) {
      return null;
    }

    return (
      <View style={styles.header}>
        <Text style={styles.headerText}>
          Available Shifts ({safeShifts.length})
        </Text>
        <Text style={styles.subHeaderText}>
          Showing opportunities near your location
        </Text>
      </View>
    );
  }, [safeShifts.length, loading]);

  const renderEmptyState = useCallback(() => {
    if (loading) {
      return null;
    }

    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyStateIcon}>📋</Text>
        <Text style={styles.emptyStateTitle}>No Shifts Available</Text>
        <Text style={styles.emptyStateText}>
          There are no shifts available in your area right now.{'\n'}
          Pull down to refresh or try again later.
        </Text>
      </View>
    );
  }, [loading]);

  const renderErrorState = useCallback(() => {
    if (!error) return null;

    return (
      <View style={styles.errorState}>
        <Text style={styles.errorIcon}>⚠️</Text>
        <Text style={styles.errorTitle}>Something went wrong</Text>
        <Text style={styles.errorText}>{error}</Text>
        <Text style={styles.errorSubText}>Pull down to try again</Text>
      </View>
    );
  }, [error]);

  if (loading && safeShifts.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text style={styles.loadingText}>Finding shifts near you...</Text>
      </View>
    );
  }

  if (error && safeShifts.length === 0) {
    return (
      <View style={styles.container}>
        {renderErrorState()}
        <RefreshControl
          refreshing={loading}
          onRefresh={() => loadShifts(true)}
          colors={['#3498db']}
          tintColor="#3498db"
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={safeShifts}
        renderItem={renderShiftItem}
        keyExtractor={keyExtractor}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={() => loadShifts(true)}
            colors={['#3498db']}
            tintColor="#3498db"
          />
        }
        contentContainerStyle={[
          styles.listContent,
          safeShifts.length === 0 && styles.emptyListContent,
        ]}
        showsVerticalScrollIndicator={false}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={10}
        removeClippedSubviews={true}
        getItemLayout={(data, index) => ({
          length: 180, // Approximate item height
          offset: 180 * index,
          index,
        })}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
  },
  listContent: {
    flexGrow: 1,
    paddingVertical: 8,
  },
  emptyListContent: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
    marginBottom: 8,
  },
  headerText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: 4,
  },
  subHeaderText: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 64,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    lineHeight: 24,
  },
  errorState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 64,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#e74c3c',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 8,
  },
  errorSubText: {
    fontSize: 14,
    color: '#95a5a6',
    textAlign: 'center',
  },
});

export default ShiftListScreen;
