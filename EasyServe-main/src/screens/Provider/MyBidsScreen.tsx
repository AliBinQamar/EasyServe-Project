// ============================================
// screens/Provider/MyBidsScreen.tsx - FIXED
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
import api from '../../config/api';
import { logger } from '../../utils/logger';
import { formatters } from '../../utils/formatter';
import { Bid } from '../../types';

const TAG = 'MyBidsScreen';

// ✅ LOCAL BID STATUS COLORS - ONLY FOR BIDS
const BID_STATUS_COLORS = {
  pending: '#FF9800',
  accepted: '#4CAF50',
  rejected: '#F44336',
};

const BID_STATUS_ICONS = {
  pending: '⏳',
  accepted: '✓',
  rejected: '✕',
};

export default function MyBidsScreen({ navigation }: any) {
  const [bids, setBids] = useState<Bid[]>([]);
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

      const res = await api.get(`/service-requests/provider-bids/${user.id}`);
      const sortedBids = (res.data || []).sort(
        (a: Bid, b: Bid) =>
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

  // ✅ SAFE COLOR GETTER FOR BID STATUS
  const getBidStatusColor = (status: Bid['status']): string => {
    return BID_STATUS_COLORS[status] || '#999';
  };

  // ✅ SAFE ICON GETTER FOR BID STATUS
  const getBidStatusIcon = (status: Bid['status']): string => {
    return BID_STATUS_ICONS[status] || '•';
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
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
          <Text style={styles.emptyIcon}>📭</Text>
          <Text style={styles.emptyText}>No bids yet</Text>
          <Text style={styles.emptySubtext}>Start bidding on available requests</Text>
          <TouchableOpacity
            style={styles.browseButton}
            onPress={() => navigation.replace('AvailableRequests')}
          >
            <Text style={styles.browseButtonText}>Browse Requests</Text>
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
              <View style={styles.bidHeader}>
                <View style={styles.bidInfo}>
                  <Text style={styles.bidAmount}>
                    {formatters.currency(item.proposedAmount)}
                  </Text>
                  <Text style={styles.bidDate}>
                    {formatters.date(item.createdAt || '')}
                  </Text>
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: getBidStatusColor(item.status) },
                  ]}
                >
                  <Text style={styles.statusIcon}>
                    {getBidStatusIcon(item.status)}
                  </Text>
                  <Text style={styles.statusText}>
                    {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                  </Text>
                </View>
              </View>

              {item.note && (
                <Text style={styles.bidNote} numberOfLines={2}>
                  {item.note}
                </Text>
              )}

              {item.attachments && item.attachments.length > 0 && (
                <View style={styles.attachmentsInfo}>
                  <Text style={styles.attachmentCount}>
                    📎 {item.attachments.length} attachment(s)
                  </Text>
                </View>
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
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyIcon: { fontSize: 80, marginBottom: 20 },
  emptyText: { fontSize: 20, fontWeight: '700', color: '#333', marginBottom: 8 },
  emptySubtext: { fontSize: 15, color: '#999', textAlign: 'center', marginBottom: 30 },
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
    alignItems: 'center',
  },
  bidInfo: { flex: 1 },
  bidAmount: { fontSize: 18, fontWeight: '800', color: '#2196F3', marginBottom: 4 },
  bidDate: { fontSize: 12, color: '#999' },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  statusIcon: { fontSize: 12, fontWeight: '700' },
  statusText: { fontSize: 12, fontWeight: '700', color: '#fff', textTransform: 'uppercase' },
  bidNote: { fontSize: 13, color: '#666', marginTop: 12, lineHeight: 18 },
  attachmentsInfo: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#f0f0f0' },
  attachmentCount: { fontSize: 12, color: '#666', fontWeight: '500' },
});
