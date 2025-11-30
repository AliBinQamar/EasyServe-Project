import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { auth } from '../../config/firebase';
import { bookingService } from '../../services/bookingService';
import { Booking } from '../../types/booking';

export default function MyBookingsScreen({ navigation }: any) {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadBookings();
    }, []);

    const loadBookings = async () => {
        try {
            if (auth.currentUser) {
                const data = await bookingService.getByUserId(auth.currentUser.uid);
                setBookings(data.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()));
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
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

    const getStatusText = (status: string) => {
        return status.charAt(0).toUpperCase() + status.slice(1);
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
                <ActivityIndicator size="large" color="#4CAF50" style={styles.loader} />
            ) : bookings.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyIcon}>📋</Text>
                    <Text style={styles.emptyText}>No bookings yet</Text>
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
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <View style={styles.bookingCard}>
                            <View style={styles.cardHeader}>
                                <Text style={styles.providerName}>{item.providerName}</Text>
                                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                                    <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
                                </View>
                            </View>
                            <View style={styles.cardRow}>
                                <Text style={styles.label}>📅 Date:</Text>
                                <Text style={styles.value}>{item.date}</Text>
                            </View>
                            <View style={styles.cardRow}>
                                <Text style={styles.label}>🕐 Time:</Text>
                                <Text style={styles.value}>{item.time}</Text>
                            </View>
                            {item.note && (
                                <View style={styles.noteContainer}>
                                    <Text style={styles.noteLabel}>Note:</Text>
                                    <Text style={styles.noteText}>{item.note}</Text>
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
        color: '#4CAF50',
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
        padding: 40,
    },
    emptyIcon: {
        fontSize: 60,
        marginBottom: 20,
    },
    emptyText: {
        fontSize: 18,
        color: '#666',
        marginBottom: 30,
    },
    browseButton: {
        backgroundColor: '#4CAF50',
        paddingHorizontal: 30,
        paddingVertical: 12,
        borderRadius: 10,
    },
    browseButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
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
        alignItems: 'center',
        marginBottom: 12,
    },
    providerName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#333',
        flex: 1,
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
    cardRow: {
        flexDirection: 'row',
        marginBottom: 6,
    },
    label: {
        fontSize: 14,
        color: '#666',
        width: 80,
    },
    value: {
        fontSize: 14,
        color: '#333',
        fontWeight: '500',
        flex: 1,
    },
    noteContainer: {
        marginTop: 10,
        paddingTop: 10,
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
});