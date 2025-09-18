import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Shift } from '../types';
import CompanyAvatar from './CompanyAvatar';

interface ShiftListItemProps {
  shift: Shift;
  onPress?: (shift: Shift) => void;
}

const ShiftListItem: React.FC<ShiftListItemProps> = ({ shift, onPress }) => {
  const handlePress = () => {
    onPress?.(shift);
  };

  const formatWorkTypes = () => {
    if (
      !shift.workTypes ||
      !Array.isArray(shift.workTypes) ||
      shift.workTypes.length === 0
    ) {
      return 'No work type specified';
    }
    return (
      shift.workTypes
        .filter(type => type && type.name)
        .map(type => type.name)
        .join(', ') || 'No work type specified'
    );
  };

  const formatWorkers = () => {
    const current = shift.currentWorkers ?? 0;
    const planned = shift.planWorkers ?? 0;
    return `${current}/${planned} workers`;
  };

  const formatRating = () => {
    const feedbackCount = parseInt(shift.customerFeedbacksCount, 10);

    if (
      !shift.customerFeedbacksCount ||
      isNaN(feedbackCount) ||
      feedbackCount === 0
    ) {
      return 'No reviews';
    }

    const rating = shift.customerRating;
    if (rating === null || rating === undefined || isNaN(rating)) {
      return `No rating (${feedbackCount})`;
    }

    return `★ ${rating.toFixed(1)} (${feedbackCount})`;
  };

  const formatPrice = () => {
    const price = shift.priceWorker;
    const bonus = shift.bonusPriceWorker;

    if (price === null || price === undefined || isNaN(price)) {
      return 'Price not specified';
    }

    if (bonus && bonus > 0) {
      const total = price + bonus;
      return `₽${price.toLocaleString()} (+₽${bonus.toLocaleString()})`;
    }

    return `₽${price.toLocaleString()}`;
  };

  const formatTime = () => {
    const startTime = shift.timeStartByCity || 'TBD';
    const endTime = shift.timeEndByCity || 'TBD';
    return `${startTime} - ${endTime}`;
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <CompanyAvatar
          logoUrl={shift.logo}
          companyName={shift.companyName || ''}
          size={50}
          style={styles.logoContainer}
        />

        <View style={styles.headerInfo}>
          <Text style={styles.companyName} numberOfLines={1}>
            {shift.companyName || 'Company name not available'}
          </Text>
          <Text style={styles.workTypes} numberOfLines={1}>
            {formatWorkTypes()}
          </Text>
          <Text style={styles.rating}>{formatRating()}</Text>
        </View>

        <View style={styles.priceContainer}>
          <Text style={styles.price}>{formatPrice()}</Text>
        </View>
      </View>

      <View style={styles.details}>
        <View style={styles.detailRow}>
          <Text style={styles.detailIcon}>•</Text>
          <Text style={styles.address} numberOfLines={2}>
            {shift.address || 'Address not specified'}
          </Text>
        </View>

        <View style={styles.bottomRow}>
          <View style={styles.leftDetails}>
            <Text style={styles.date}>
              {shift.dateStartByCity || 'Date TBD'}
            </Text>
            <Text style={styles.time}>{formatTime()}</Text>
          </View>

          <View style={styles.rightDetails}>
            <Text style={styles.workers}>{formatWorkers()}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 6,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  logoContainer: {
    marginRight: 12,
  },
  headerInfo: {
    flex: 1,
    marginRight: 12,
  },
  companyName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  workTypes: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 4,
  },
  rating: {
    fontSize: 12,
    color: '#f39c12',
    fontWeight: '500',
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  price: {
    fontSize: 18,
    fontWeight: '700',
    color: '#27ae60',
  },
  details: {
    borderTopWidth: 1,
    borderTopColor: '#ecf0f1',
    paddingTop: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  detailIcon: {
    fontSize: 14,
    marginRight: 8,
    marginTop: 2,
  },
  address: {
    flex: 1,
    fontSize: 14,
    color: '#34495e',
    lineHeight: 20,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  leftDetails: {
    flex: 1,
  },
  rightDetails: {
    alignItems: 'flex-end',
  },
  date: {
    fontSize: 14,
    color: '#2c3e50',
    fontWeight: '500',
    marginBottom: 2,
  },
  time: {
    fontSize: 13,
    color: '#7f8c8d',
  },
  workers: {
    fontSize: 12,
    color: '#95a5a6',
    backgroundColor: '#ecf0f1',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    overflow: 'hidden',
  },
});

export default ShiftListItem;
