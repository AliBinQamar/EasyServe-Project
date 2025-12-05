import { StyleSheet } from 'react-native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Text, TouchableOpacity, View } from 'react-native';
import { bookingService } from '../../services/bookingService';
import { Booking } from '../../types';

export default function ManageBookingScreen({ navigation }: any) {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadBookings();
    }, []);

    const loadBookings = async () => {
        try {
            const data = await bookingService.getAll();
            const sortedData = data.sort(
                (a: Booking, b: Booking) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
            setBookings(sortedData);
        } catch (error: any) {
            console.error(error);
            const errorMessage = error.response?.data?.message || 'Failed to load bookings';
            Alert.alert('Error', errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (bookingId: string, status: 'confirmed' | 'rejected') => {
        if (!bookingId) {
            Alert.alert('Error', 'Invalid booking ID');
            return;
        }

        try {
            await bookingService.updateStatus(bookingId, status);
            Alert.alert('Success', `Booking ${status}`);
            loadBookings();
        } catch (error: any) {
            console.error(error);
            const errorMessage = error.response?.data?.message || 'Failed to update booking';
            Alert.alert('Error', errorMessage);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'confirmed':
                return '#4CAF50';
            case 'rejected':
                return '#f44336';
            default:
                return '#FF9800';
        }
    };

    return (
        <View style={{ flex: 1 }}>
            {/* Header */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 20 }}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text>← Back</Text>
                </TouchableOpacity>
                <Text>Manage Bookings</Text>
                <View style={{ width: 50 }} />
            </View>

            {/* Loader */}
            {loading ? (
                <ActivityIndicator size="large" color="#2196F3" style={{ marginTop: 50 }} />
            ) : bookings.length === 0 ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <Text style={{ fontSize: 60 }}>📋</Text>
                    <Text>No bookings available</Text>
                </View>
            ) : (
                <FlatList
                    data={bookings}
                    keyExtractor={(item, index) => item._id || index.toString()} // FIXED
                    renderItem={({ item }) => (
                        <View style={{ backgroundColor: '#fff', marginBottom: 12, borderRadius: 12, padding: 15 }}>
                            {/* Header */}
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
                                <View style={{ flex: 1 }}>
                                    <Text style={{ fontWeight: '700' }}>{item.providerName}</Text>
                                    <Text style={{ color: '#666' }}>by {item.userName}</Text>
                                </View>
                                <View
                                    style={{
                                        backgroundColor: getStatusColor(item.status),
                                        paddingHorizontal: 10,
                                        paddingVertical: 4,
                                        borderRadius: 12,
                                    }}
                                >
                                    <Text style={{ color: '#fff', fontWeight: '600' }}>
                                        {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                                    </Text>
                                </View>
                            </View>

                            {/* Details */}
                            <View>
                                <Text>📅 Date: {item.date}</Text>
                                <Text>🕐 Time: {item.time}</Text>
                                {item.note && (
                                    <Text style={{ marginTop: 4 }}>📝 Note: {item.note}</Text>
                                )}
                            </View>

                            {/* Actions */}
                            {item.status === 'pending' && (
                                <View style={{ flexDirection: 'row', marginTop: 10, gap: 10 }}>
                                    <TouchableOpacity
                                        style={{ flex: 1, backgroundColor: '#4CAF50', padding: 10, borderRadius: 8, alignItems: 'center' }}
                                        onPress={() => handleUpdateStatus(item._id!, 'confirmed')}
                                    >
                                        <Text style={{ color: '#fff', fontWeight: '600' }}>✓ Confirm</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={{ flex: 1, backgroundColor: '#f44336', padding: 10, borderRadius: 8, alignItems: 'center' }}
                                        onPress={() => handleUpdateStatus(item._id!, 'rejected')}
                                    >
                                        <Text style={{ color: '#fff', fontWeight: '600' }}>✗ Reject</Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>
                    )}
                    contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
                />
            )}
        </View>
    );
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  backButton: {
    fontSize: 16,
    color: '#2196F3',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  loader: {
    marginTop: 50,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 60,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  bookingCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 18,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  headerLeft: {
    flex: 1,
  },
  providerName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  userName: {
    fontSize: 13,
    color: '#666',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  detailsContainer: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    width: 80,
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    flex: 1,
  },
  noteContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  noteLabel: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  noteText: {
    fontSize: 13,
    color: '#333',
  },
  actionsContainer: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 10,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  confirmButton: {
    backgroundColor: '#4CAF50',
  },
  rejectButton: {
    backgroundColor: '#f44336',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
