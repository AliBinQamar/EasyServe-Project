// ============================================
// screens/user/MyBookingsScreen.tsx - FIXED
// ============================================

import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { authService } from '../../services/authService';
import { bookingService } from '../../services/bookingService';
import { logger } from '../../utils/logger';
import { formatters } from '../../utils/formatter';
import { Booking } from '../../types';

const TAG = 'MyBookingsScreen';

// ✅ LOCAL BOOKING STATUS COLORS - ONLY FOR BOOKINGS
const BOOKING_STATUS_COLORS: Record<Booking['status'], string> = {
  confirmed: '#4CAF50',
  'in-progress': '#FF9800',
  completed: '#4CAF50',
  cancelled: '#F44336',
  disputed: '#FF5722',
};

const BOOKING_STATUS_ICONS: Record<Booking['status'], string> = {
  confirmed: '✓',
  'in-progress': '⏳',
  completed: '✓',
  cancelled: '✕',
  disputed: '⚠️',
};

export default function MyBookingsScreen({ navigation }: any) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadBookings();
    return () => setBookings([]);
  }, []);

  const loadBookings = async () => {
    try {
      const user = await authService.getCurrentUser();
      if (!user) return;

      logger.info(TAG, `Loading bookings for user: ${user.id}`);

      const data = await bookingService.getByUserId(user.id);
      const sortedData = (data || []).sort(
        (a: Booking, b: Booking) =>
          new Date(b.createdAt || '').getTime() -
          new Date(a.createdAt || '').getTime()
      );

      setBookings(sortedData);
      logger.info(TAG, `Loaded ${sortedData.length} bookings`);
    } catch (error) {
      logger.error(TAG, 'Error loading bookings', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadBookings();
  };

  // ✅ SAFE COLOR GETTER FOR BOOKING STATUS
  const getStatusColor = (status: Booking['status']): string => {
    return BOOKING_STATUS_COLORS[status] || '#999';
  };

  // ✅ SAFE ICON GETTER FOR BOOKING STATUS
  const getStatusIcon = (status: Booking['status']): string => {
    return BOOKING_STATUS_ICONS[status] || '•';
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>My Bookings</Text>
        <View style={{ width: 50 }} />
      </View>

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
        </View>
      ) : bookings.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📋</Text>
          <Text style={styles.emptyText}>No bookings yet</Text>
          <Text style={styles.emptySubtext}>Start booking services now</Text>
          <TouchableOpacity
            style={styles.browseButton}
            onPress={() => navigation.navigate('Home')}
          >
            <Text style={styles.browseButtonText}>Browse Services</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={bookings}
          keyExtractor={(item) => item._id || `booking-${Math.random()}`}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#4CAF50']}
            />
          }
          renderItem={({ item }) => (
            <View style={styles.bookingCard}>
              <View style={styles.cardHeader}>
                <View style={styles.providerInfo}>
                  <View style={styles.providerAvatar}>
                    <Text style={styles.avatarText}>👤</Text>
                  </View>
                  <View style={styles.providerDetails}>
                    <Text style={styles.providerName}>
                      {item.providerName}
                    </Text>
                    <Text style={styles.price}>
                      {formatters.currency(item.agreedPrice)}
                    </Text>
                  </View>
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(item.status) },
                  ]}
                >
                  <Text style={styles.statusIcon}>
                    {getStatusIcon(item.status)}
                  </Text>
                  <Text style={styles.statusText}>
                    {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                  </Text>
                </View>
              </View>

              <View style={styles.cardDetails}>
                {item.createdAt && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>📅 Date:</Text>
                    <Text style={styles.detailValue}>
                      {formatters.date(item.createdAt)}
                    </Text>
                  </View>
                )}

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>💰 Amount:</Text>
                  <Text style={styles.detailValue}>
                    {formatters.currency(item.agreedPrice)}
                  </Text>
                </View>

                {/* ✅ SAFE CHECK FOR isPaid */}
                {item.isPaid === true && (
                  <View style={styles.paidBadge}>
                    <Text style={styles.paidText}>✓ Payment Confirmed</Text>
                  </View>
                )}

                {/* ✅ SAFE CHECK FOR userRating */}
                {item.status === 'completed' && item.userRating && item.userRating > 0 && (
                  <View style={styles.ratingBadge}>
                    <Text style={styles.ratingText}>
                      ⭐ Rated {item.userRating}.0
                    </Text>
                  </View>
                )}
              </View>

              <TouchableOpacity
                style={styles.detailsButton}
                onPress={() =>
                  navigation.navigate('BookingDetails', {
                    bookingId: item._id,
                  })
                }
              >
                <Text style={styles.detailsButtonText}>View Details →</Text>
              </TouchableOpacity>
            </View>
          )}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: { fontSize: 16, color: '#4CAF50', fontWeight: '600' },
  title: { fontSize: 18, fontWeight: '800', color: '#333' },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyIcon: { fontSize: 60, marginBottom: 20 },
  emptyText: { fontSize: 18, color: '#666', marginBottom: 8 },
  emptySubtext: { fontSize: 14, color: '#999', marginBottom: 30 },
  browseButton: { backgroundColor: '#4CAF50', paddingHorizontal: 30, paddingVertical: 12, borderRadius: 25 },
  browseButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  list: { padding: 20 },
  bookingCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  providerInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  providerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F0F9FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: { fontSize: 24 },
  providerDetails: { flex: 1 },
  providerName: { fontSize: 15, fontWeight: '700', color: '#333', marginBottom: 4 },
  price: { fontSize: 16, fontWeight: '800', color: '#4CAF50' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12, gap: 4 },
  statusIcon: { fontSize: 11, fontWeight: '700' },
  statusText: { fontSize: 11, fontWeight: '700', color: '#fff', textTransform: 'uppercase' },
  cardDetails: { marginBottom: 12 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  detailLabel: { fontSize: 13, color: '#666', fontWeight: '500' },
  detailValue: { fontSize: 13, color: '#333', fontWeight: '600' },
  paidBadge: { backgroundColor: '#F0FDF4', padding: 8, borderRadius: 8, marginTop: 8 },
  paidText: { fontSize: 12, fontWeight: '600', color: '#4CAF50', textAlign: 'center' },
  ratingBadge: { backgroundColor: '#FFF3E0', padding: 8, borderRadius: 8, marginTop: 8 },
  ratingText: { fontSize: 12, fontWeight: '600', color: '#F57C00', textAlign: 'center' },
  detailsButton: { backgroundColor: '#4CAF50', borderRadius: 12, padding: 12, alignItems: 'center' },
  detailsButtonText: { color: '#fff', fontSize: 14, fontWeight: '700' },
});