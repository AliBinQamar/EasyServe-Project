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
import { STATUS_COLORS, STATUS_ICONS } from '../../utils/constants';
import { formatters } from '../../utils/formatter';
import { ServiceRequest } from '../../types';
const TAG = 'MyRequestsScreen';


export default function MyRequestsScreen({ navigation }: any) {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadRequests();
    return () => setRequests([]);
  }, []);

  const loadRequests = async () => {
    try {
      const user = await authService.getCurrentUser();
      if (!user) return;

      const res = await api.get('/service-requests', {
        params: { userId: user.id },
      });

      const sortedRequests = (res.data || []).sort(
        (a: ServiceRequest, b: ServiceRequest) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      setRequests(sortedRequests);
      logger.info(TAG, `Loaded ${sortedRequests.length} requests`);
    } catch (error) {
      logger.error(TAG, 'Error loading requests', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadRequests();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>My Requests</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Home')}>
          <Text style={styles.addButton}>+ New</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
        </View>
      ) : requests.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📝</Text>
          <Text style={styles.emptyText}>No service requests yet</Text>
          <Text style={styles.emptySubtext}>Create your first request to get started</Text>
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => navigation.navigate('Home')}
          >
            <Text style={styles.createButtonText}>Create Request</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={requests}
          keyExtractor={(item) => item._id}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#4CAF50']}
            />
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() =>
                navigation.navigate('RequestDetails', { requestId: item._id })
              }
            >
              <View style={styles.cardHeader}>
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryText}>{item.categoryName}</Text>
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: STATUS_COLORS[item.status] },
                  ]}
                >
                  <Text style={styles.statusIcon}>
                    {STATUS_ICONS[item.status]}
                  </Text>
                  <Text style={styles.statusText}>{item.status}</Text>
                </View>
              </View>

              <Text style={styles.description} numberOfLines={2}>
                {item.description}
              </Text>

              <View style={styles.cardFooter}>
                {item.requestType === 'fixed' ? (
                  <View style={styles.priceTag}>
                    <Text style={styles.priceLabel}>Fixed:</Text>
                    <Text style={styles.priceValue}>
                      {formatters.currency(item.fixedAmount || 0)}
                    </Text>
                  </View>
                ) : (
                  <View style={styles.priceTag}>
                    <Text style={styles.bidsText}>Open for Bids 💰</Text>
                  </View>
                )}
                <Text style={styles.dateText}>
                  {formatters.date(item.createdAt)}
                </Text>
              </View>

              {item.status === 'bidding' && (
                <View style={styles.bidsIndicator}>
                  <Text style={styles.bidsIndicatorText}>
                    🔔 New bids available
                  </Text>
                </View>
              )}
            </TouchableOpacity>
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
  backButton: { fontSize: 16, color: '#4CAF50', fontWeight: '600' },
  title: { fontSize: 20, fontWeight: '800', color: '#333' },
  addButton: { fontSize: 16, color: '#4CAF50', fontWeight: '700' },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyIcon: { fontSize: 80, marginBottom: 20 },
  emptyText: { fontSize: 20, fontWeight: '700', color: '#333', marginBottom: 8 },
  emptySubtext: { fontSize: 15, color: '#999', textAlign: 'center', marginBottom: 30 },
  createButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  createButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  list: { padding: 20 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  categoryBadge: { backgroundColor: '#E3F2FD', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  categoryText: { fontSize: 12, fontWeight: '700', color: '#1976D2' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12, gap: 4 },
  statusIcon: { fontSize: 12 },
  statusText: { fontSize: 11, fontWeight: '700', color: '#fff', textTransform: 'uppercase' },
  description: { fontSize: 15, color: '#333', lineHeight: 22, marginBottom: 12 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  priceTag: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  priceLabel: { fontSize: 13, color: '#666', fontWeight: '500' },
  priceValue: { fontSize: 16, fontWeight: '800', color: '#4CAF50' },
  bidsText: { fontSize: 14, fontWeight: '700', color: '#FF9800' },
  dateText: { fontSize: 12, color: '#999' },
  bidsIndicator: { marginTop: 12, backgroundColor: '#FFF3E0', padding: 8, borderRadius: 8, alignItems: 'center' },
  bidsIndicatorText: { fontSize: 13, fontWeight: '600', color: '#F57C00' },
});