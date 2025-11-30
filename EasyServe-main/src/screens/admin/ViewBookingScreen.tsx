import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { bookingService } from '../../services/bookingService';
import { Booking } from '../../types/booking';

export default function ViewBookingScreen({ navigation }: any) {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadBookings();
    }, []);

    const loadBookings = async () => {
        try {
            const data = await bookingService.getAll();
            setBookings(data.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()));
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (bookingId: string, status: 'confirmed' | 'rejected') => {
        try {
            await bookingService.updateStatus(bookingId, status);
            Alert.alert('Success', `Booking ${status}`);
            loadBookings();
        } catch (error: any) {
            Alert.alert('Error', error.message);
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
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={styles.backButton}>← Back</Text>
                </TouchableOpacity>
                <Text style={styles.title}>All Bookings</Text>
                <View style={{ width: 50 }} />
            </View>

            {loading ? (
                <ActivityIndicator size="large" color="#2196F3" style={styles.loader} />
            ) : bookings.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyIcon}>📋</Text>
                    <Text style={styles.emptyText}>No bookings yet</Text>
                </View>
            ) : (
                <FlatList
                    data={bookings}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <View style={styles.bookingCard}>
                            <View style={styles.cardHeader}>
                                <View style={styles.headerLeft}>
                                    <Text style={styles.providerName}>{item.providerName}</Text>
                                    <Text style={styles.userName}>by {item.userName}</Text>
                                </View>
                                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                                    <Text style={styles.statusText}>
                                        {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                                    </Text>
                                </View>
                            </View>

                            <View style={styles.detailsContainer}>
                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>📅 Date:</Text>
                                    <Text style={styles.detailValue}>{item.date}</Text>
                                </View>
                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>🕐 Time:</Text>
                                    <Text style={styles.detailValue}>{item.time}</Text>
                                </View>
                                {item.note && (
                                    <View style={styles.noteContainer}>
                                        <Text style={styles.noteLabel}>Note:</Text>
                                        <Text style={styles.noteText}>{item.note}</Text>
                                    </View>
                                )}
                            </View>

                            {item.status === 'pending' && (
                                <View style={styles.actionsContainer}>
                                    <TouchableOpacity
                                        style={[styles.actionButton, styles.confirmButton]}
                                        onPress={() => handleUpdateStatus(item.id, 'confirmed')}
                                    >
                                        <Text style={styles.actionButtonText}>✓ Confirm</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.actionButton, styles.rejectButton]}
                                        onPress={() => handleUpdateStatus(item.id, 'rejected')}
                                    >
                                        <Text style={styles.actionButtonText}>✗ Reject</Text>
                                    </TouchableOpacity>
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
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        paddingTop: 50,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    backButton: {
        fontSize: 16,
        color: '#2196F3',
    },
    title: {
        fontSize: 18,
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
        marginBottom: 20,
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
        borderRadius: 12,
        padding: 15,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
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
        paddingVertical: 4,
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
        gap: 10,
        marginTop: 10,
    },
    actionButton: {
        flex: 1,
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
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