import React from 'react';
import { View, ScrollView, Text, StyleSheet } from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Shift } from '../types';
import CompanyAvatar from '../components/CompanyAvatar';

type RootStackParamList = {
  ShiftList: undefined;
  ShiftDetail: { shift: Shift };
};

type ShiftDetailScreenRouteProp = RouteProp<RootStackParamList, 'ShiftDetail'>;

const ShiftDetailScreen: React.FC = () => {
  const route = useRoute<ShiftDetailScreenRouteProp>();

  const { shift } = route.params;

  const formatWorkTypes = (workTypes: typeof shift.workTypes) => {
    return workTypes.map(workType => workType.name).join(', ');
  };

  const formatPrice = (price: number) => {
    return `$${price.toFixed(2)}`;
  };

  const formatRating = (rating: number | null) => {
    if (rating === null) return 'Not rated';
    return `${rating.toFixed(1)} ⭐`;
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.headerCard}>
        <View style={styles.companyInfo}>
          <CompanyAvatar
            logoUrl={shift.logo}
            companyName={shift.companyName}
            size={60}
            borderRadius={8}
          />
          <View style={styles.companyDetails}>
            <Text style={styles.companyName}>{shift.companyName}</Text>
            <Text style={styles.shiftId}>ID: {shift.id}</Text>
          </View>
        </View>
        {shift.isPromotionEnabled && (
          <View style={styles.promotionBadge}>
            <Text style={styles.promotionText}>🎯 PROMOTED</Text>
          </View>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>📍 Location & Schedule</Text>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Address:</Text>
          <Text style={styles.value}>{shift.address}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Date:</Text>
          <Text style={styles.value}>{shift.dateStartByCity}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Time:</Text>
          <Text style={styles.value}>
            {shift.timeStartByCity} - {shift.timeEndByCity}
          </Text>
        </View>
        <View style={styles.coordinatesContainer}>
          <Text style={styles.label}>Coordinates:</Text>
          <Text style={styles.coordinates}>
            {shift.coordinates.latitude.toFixed(6)},{' '}
            {shift.coordinates.longitude.toFixed(6)}
          </Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>💼 Work Details</Text>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Work Types:</Text>
          <Text style={styles.value}>{formatWorkTypes(shift.workTypes)}</Text>
        </View>
        <View style={styles.workersInfo}>
          <View style={styles.workersColumn}>
            <Text style={styles.workersNumber}>{shift.currentWorkers}</Text>
            <Text style={styles.workersLabel}>Current Workers</Text>
          </View>
          <View style={styles.workersColumn}>
            <Text style={styles.workersNumber}>{shift.planWorkers}</Text>
            <Text style={styles.workersLabel}>Planned Workers</Text>
          </View>
          <View style={styles.workersColumn}>
            <Text style={styles.workersNumber}>
              {shift.planWorkers - shift.currentWorkers}
            </Text>
            <Text style={styles.workersLabel}>Available Spots</Text>
          </View>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>💰 Payment</Text>
        <View style={styles.paymentContainer}>
          <View style={styles.priceItem}>
            <Text style={styles.priceLabel}>Base Rate</Text>
            <Text style={styles.basePrice}>
              {formatPrice(shift.priceWorker)}
            </Text>
          </View>
          {shift.bonusPriceWorker > 0 && (
            <View style={styles.priceItem}>
              <Text style={styles.priceLabel}>Bonus</Text>
              <Text style={styles.bonusPrice}>
                +{formatPrice(shift.bonusPriceWorker)}
              </Text>
            </View>
          )}
          <View style={styles.totalPriceContainer}>
            <Text style={styles.totalPriceLabel}>Total Rate</Text>
            <Text style={styles.totalPrice}>
              {formatPrice(shift.priceWorker + shift.bonusPriceWorker)}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>⭐ Customer Feedback</Text>
        <View style={styles.ratingContainer}>
          <View style={styles.ratingItem}>
            <Text style={styles.ratingValue}>
              {formatRating(shift.customerRating)}
            </Text>
            <Text style={styles.ratingLabel}>Rating</Text>
          </View>
          <View style={styles.ratingItem}>
            <Text style={styles.feedbackValue}>
              {shift.customerFeedbacksCount}
            </Text>
            <Text style={styles.ratingLabel}>Reviews</Text>
          </View>
        </View>
      </View>
      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  headerCard: {
    backgroundColor: '#ffffff',
    margin: 16,
    marginBottom: 8,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  companyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  companyDetails: {
    marginLeft: 16,
    flex: 1,
  },
  companyName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: 4,
  },
  shiftId: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  promotionBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#e74c3c',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  promotionText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '700',
  },
  card: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#7f8c8d',
    width: 100,
    flexShrink: 0,
  },
  value: {
    fontSize: 14,
    color: '#2c3e50',
    flex: 1,
    flexWrap: 'wrap',
  },
  coordinatesContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  coordinates: {
    fontSize: 12,
    color: '#2c3e50',
    fontFamily: 'monospace',
    flex: 1,
  },
  workersInfo: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#ecf0f1',
  },
  workersColumn: {
    alignItems: 'center',
  },
  workersNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#3498db',
    marginBottom: 4,
  },
  workersLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    textAlign: 'center',
  },
  paymentContainer: {
    gap: 12,
  },
  priceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  basePrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
  },
  bonusPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#27ae60',
  },
  totalPriceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#ecf0f1',
  },
  totalPriceLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
  },
  totalPrice: {
    fontSize: 20,
    fontWeight: '700',
    color: '#27ae60',
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  ratingItem: {
    alignItems: 'center',
  },
  ratingValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#f39c12',
    marginBottom: 4,
  },
  feedbackValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#3498db',
    marginBottom: 4,
  },
  ratingLabel: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  applyButton: {
    backgroundColor: '#3498db',
    marginHorizontal: 16,
    marginTop: 8,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#3498db',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  applyButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  bottomSpacer: {
    height: 20,
  },
});

export default ShiftDetailScreen;
