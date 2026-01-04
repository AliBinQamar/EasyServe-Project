import React, { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Pressable } from 'react-native';
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
import api from '../../config/api';
import { logger } from '../../utils/logger';
import { formatters } from '../../utils/formatter';
import { Bid } from '../../types';

const TAG = 'MyBidsScreen';

// ✅ UPDATED STATUS COLORS - Including booking statuses
const BID_STATUS_COLORS = {
  pending: '#FF9800',
  accepted: '#4CAF50',
  rejected: '#F44336',
  confirmed: '#2196F3',
  'in-progress': '#FF9800',
  completed: '#4CAF50',
  'payment-released': '#4CAF50',
};

const BID_STATUS_ICONS = {
  pending: '⏳',
  accepted: '✓',
  rejected: '✕',
  confirmed: '📋',
  'in-progress': '⚙️',
  completed: '✓',
  'payment-released': '💰',
};

// ✅ ENHANCED BID INTERFACE
interface EnhancedBid extends Bid {
  bookingStatus?: string;
  bookingId?: string;
  actualStatus?: string; // The real status to display
}

export default function MyBidsScreen({ navigation }: any) {
  const [bids, setBids] = useState<EnhancedBid[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadBids();
    return () => setBids([]);
  }, []);

  const loadBids = async () => {
    try {
      const user = await authService.getCurrentUser();
      if (!user) return;

      logger.info(TAG, `Loading bids for provider: ${user.id}`);

      // ✅ Fetch bids
      const res = await api.get(`/service-requests/provider-bids/${user.id}`);
      
      // ✅ For each accepted bid, fetch the booking status
      const bidsWithBookings = await Promise.all(
        (res.data || []).map(async (bid: Bid) => {
          if (bid.status === 'accepted') {
            try {
              // Fetch booking for this bid
              const bookingRes = await api.get('/bookings', {
                params: { 
                  providerId: user.id,
                  bidId: bid._id 
                }
              });
              
              if (bookingRes.data && bookingRes.data.length > 0) {
                const booking = bookingRes.data[0];
                return {
                  ...bid,
                  bookingStatus: booking.status,
                  bookingId: booking._id,
                  actualStatus: booking.status, // Use booking status instead
                };
              }
            } catch (error) {
              logger.error(TAG, 'Error fetching booking for bid', error);
            }
          }
          return {
            ...bid,
            actualStatus: bid.status, // Use bid status if no booking
          };
        })
      );

      const sortedBids = bidsWithBookings.sort(
        (a: EnhancedBid, b: EnhancedBid) =>
          new Date(b.createdAt || '').getTime() -
          new Date(a.createdAt || '').getTime()
      );

      setBids(sortedBids);
      logger.info(TAG, `Loaded ${sortedBids.length} bids`);
    } catch (error) {
      logger.error(TAG, 'Error loading bids', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadBids();
  };

  const getBidStatusColor = (status: string): string => {
    return BID_STATUS_COLORS[status as keyof typeof BID_STATUS_COLORS] || '#999';
  };

  const getBidStatusIcon = (status: string): string => {
    return BID_STATUS_ICONS[status as keyof typeof BID_STATUS_ICONS] || '•';
  };

  // ✅ Helper to get display status text
  const getDisplayStatusText = (status: string): string => {
    const statusMap: { [key: string]: string } = {
      'pending': 'Pending',
      'accepted': 'Accepted',
      'rejected': 'Rejected',
      'confirmed': 'Booking Confirmed',
      'in-progress': 'Service In Progress',
      'completed': 'Completed',
      'payment-released': 'Completed & Paid',
    };
    return statusMap[status] || status;
  };

  const getTimeDifference = (createdAt: string) => {
    const now = new Date().getTime();
    const created = new Date(createdAt).getTime();
    const diffInHours = Math.floor((now - created) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return 'Yesterday';
    return formatters.date(createdAt);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
            <Pressable onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={26} color="#000" />
          </Pressable>
          <Text style={styles.title}>My Bids</Text>
          <View style={{ width: 50 }} />
        </View>
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#2196F3" />
          <Text style={styles.loadingText}>Loading your bids...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>My Bids</Text>
        <View style={{ width: 50 }} />
      </View>

      {bids.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📝</Text>
          <Text style={styles.emptyText}>No bids yet</Text>
          <Text style={styles.emptySubtext}>
            Start bidding on available requests to grow your business
          </Text>
          <TouchableOpacity
            style={styles.browseButton}
            onPress={() => navigation.replace('AvailableRequests')}
          >
            <Text style={styles.browseButtonText}>🔍 Browse Requests</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={bids}
          keyExtractor={(item) => item._id || `bid-${Math.random()}`}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#2196F3']}
            />
          }
          renderItem={({ item }) => (
            <View style={styles.bidCard}>
              {/* Card Header with Amount and Status */}
              <View style={styles.bidHeader}>
                <View style={styles.bidAmountSection}>
                  <Text style={styles.bidLabel}>Your Bid</Text>
                  <Text style={styles.bidAmount}>
                    {formatters.currency(item.proposedAmount)}
                  </Text>
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: getBidStatusColor(item.actualStatus || item.status) },
                  ]}
                >
                  <Text style={styles.statusIcon}>
                    {getBidStatusIcon(item.actualStatus || item.status)}
                  </Text>
                  <Text style={styles.statusText}>
                    {getDisplayStatusText(item.actualStatus || item.status)}
                  </Text>
                </View>
              </View>

              {/* Bid Note */}
              {item.note && (
                <View style={styles.noteSection}>
                  <Text style={styles.noteLabel}>Your Note:</Text>
                  <Text style={styles.bidNote} numberOfLines={2}>
                    {item.note}
                  </Text>
                </View>
              )}

              {/* Attachments Info */}
              {item.attachments && item.attachments.length > 0 && (
                <View style={styles.attachmentsSection}>
                  <Text style={styles.attachmentIcon}>📎</Text>
                  <Text style={styles.attachmentText}>
                    {item.attachments.length} attachment{item.attachments.length > 1 ? 's' : ''}
                  </Text>
                </View>
              )}

              {/* Card Footer with Time */}
              <View style={styles.cardFooter}>
                <Text style={styles.timeText}>
                  {getTimeDifference(item.createdAt?.toString() || '')}
                </Text>
                {item.status === 'pending' && (
                  <View style={styles.pendingIndicator}>
                    <View style={styles.pulseCircle} />
                    <Text style={styles.pendingText}>Waiting for response</Text>
                  </View>
                )}
                {item.actualStatus === 'confirmed' && (
                  <View style={styles.acceptedIndicator}>
                    <Text style={styles.acceptedIcon}>📋</Text>
                    <Text style={styles.acceptedText}>Booking confirmed!</Text>
                  </View>
                )}
                {item.actualStatus === 'in-progress' && (
                  <View style={styles.inProgressIndicator}>
                    <Text style={styles.inProgressIcon}>⚙️</Text>
                    <Text style={styles.inProgressText}>Service in progress</Text>
                  </View>
                )}
                {(item.actualStatus === 'completed' || item.actualStatus === 'payment-released') && (
                  <View style={styles.completedIndicator}>
                    <Text style={styles.completedIcon}>✓</Text>
                    <Text style={styles.completedText}>Service completed!</Text>
                  </View>
                )}
              </View>

              {/* ✅ View Booking Button for accepted bids */}
              {item.bookingId && (
                <TouchableOpacity
                  style={styles.viewBookingButton}
                  onPress={() => navigation.navigate('ProviderBookings')}
                >
                  <Text style={styles.viewBookingText}>View Booking Details</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
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
  backButton: { fontSize: 16, color: '#2196F3', fontWeight: '600' },
  title: { fontSize: 20, fontWeight: '800', color: '#333' },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, fontSize: 14, color: '#666' },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyIcon: { fontSize: 80, marginBottom: 20 },
  emptyText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 15,
    color: '#999',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  browseButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
  },
  browseButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  list: { padding: 20 },
  bidCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  bidHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  bidAmountSection: { flex: 1 },
  bidLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  bidAmount: {
    fontSize: 24,
    fontWeight: '800',
    color: '#2196F3',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 6,
  },
  statusIcon: { fontSize: 14, color: '#fff' },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
    textTransform: 'uppercase',
  },
  noteSection: {
    backgroundColor: '#FFF9E6',
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#FFC107',
  },
  noteLabel: {
    fontSize: 11,
    color: '#F57C00',
    fontWeight: '700',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  bidNote: {
    fontSize: 13,
    color: '#333',
    lineHeight: 18,
    fontStyle: 'italic',
  },
  attachmentsSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F9FF',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  attachmentIcon: { fontSize: 16, marginRight: 8 },
  attachmentText: { fontSize: 12, color: '#666', fontWeight: '600' },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeText: { fontSize: 12, color: '#999', fontWeight: '500' },
  pendingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pulseCircle: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF9800',
  },
  pendingText: {
    fontSize: 12,
    color: '#FF9800',
    fontWeight: '600',
  },
  acceptedIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  acceptedIcon: { fontSize: 14 },
  acceptedText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
  },
  inProgressIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  inProgressIcon: { fontSize: 14 },
  inProgressText: {
    fontSize: 12,
    color: '#FF9800',
    fontWeight: '600',
  },
  completedIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  completedIcon: { fontSize: 14, color: '#4CAF50' },
  completedText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
  },
  viewBookingButton: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  viewBookingText: {
    fontSize: 14,
    color: '#2196F3',
    fontWeight: '700',
    textAlign: 'center',
  },
});