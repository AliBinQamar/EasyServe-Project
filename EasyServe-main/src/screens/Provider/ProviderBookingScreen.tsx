import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { authService } from '../../services/authService';
import { bookingService } from '../../services/bookingService';
import { logger } from '../../utils/logger';

export default function ProviderBookingsScreen({ navigation }: any) {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    setLoading(true);
    try {
      const provider = await authService.getCurrentUser();
      if (!provider) return;

      const data = await bookingService.getByProviderId(provider.id);
      setBookings(data || []);
      logger.info('ProviderBookings', `Loaded ${data.length} bookings`);
    } catch (error) {
      console.error('Error loading bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartService = async (bookingId: string) => {
    try {
      await bookingService.startService(bookingId);
      Alert.alert('Success', 'Service started ✅');
      loadBookings();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to start');
    }
  };

  const handleCompleteService = async (bookingId: string) => {
    try {
      await bookingService.providerCompleteService(bookingId);
      Alert.alert('Success', 'Service completed ✅');
      loadBookings();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to complete');
    }
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  if (bookings.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>No bookings assigned yet</Text>
      </View>
    );
  }

  const renderItem = ({ item }: any) => (
    <View style={styles.card}>
      <Text style={styles.title}>{item.userName}</Text>
      <Text>Service Amount: Rs. {item.agreedPrice}</Text>
      <Text>Status: {item.status}</Text>

      {item.status === 'confirmed' && (
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => handleStartService(item._id)}
        >
          <Text style={styles.primaryBtnText}>Start Service</Text>
        </TouchableOpacity>
      )}

      {item.status === 'in-progress' && !item.completedByProvider && (
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => handleCompleteService(item._id)}
        >
          <Text style={styles.primaryBtnText}>Mark Completed</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <FlatList
      data={bookings}
      keyExtractor={(item) => item._id}
      renderItem={renderItem}
      contentContainerStyle={styles.list}
    />
  );
}

const styles = StyleSheet.create({
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 16, color: '#999' },
  list: { padding: 20 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  title: { fontSize: 16, fontWeight: '700', marginBottom: 8 },
  primaryBtn: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 12,
    marginTop: 12,
    alignItems: 'center',
  },
  primaryBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
});
