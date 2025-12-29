// ============================================
// screens/user/BookingDetailsScreen.tsx - NEW
// Communication between user and provider after bid accepted
// ============================================

import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import api from '../../config/api';
import { logger } from '../../utils/logger';
import { formatters } from '../../utils/formatter';
import { Booking } from '../../types';

const TAG = 'BookingDetailsScreen';

interface BookingDetails extends Booking {
  providerPhone?: string;
  providerEmail?: string;
}

export default function BookingDetailsScreen({ route, navigation }: any) {
  const { bookingId } = route.params;
  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const [sendingMessage, setSendingMessage] = useState(false);

  useEffect(() => {
    loadBookingDetails();
    const interval = setInterval(loadBookingDetails, 5000); // Poll every 5 seconds
    return () => {
      clearInterval(interval);
      setBooking(null);
      setMessages([]);
    };
  }, []);

  const loadBookingDetails = async () => {
    try {
      logger.info(TAG, `Loading booking: ${bookingId}`);

      const res = await api.get(`/bookings/${bookingId}`);
      setBooking(res.data);

      // Load messages
      try {
        const messagesRes = await api.get(`/bookings/${bookingId}/messages`);
        setMessages(messagesRes.data || []);
      } catch (error) {
        logger.warn(TAG, 'Messages endpoint not ready yet', error);
      }
    } catch (error) {
      logger.error(TAG, 'Error loading booking', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim()) {
      Alert.alert('Error', 'Message cannot be empty');
      return;
    }

    setSendingMessage(true);
    try {
      await api.post(`/bookings/${bookingId}/messages`, {
        message: message.trim(),
      });

      logger.info(TAG, 'Message sent');
      setMessage('');
      loadBookingDetails();
    } catch (error) {
      logger.error(TAG, 'Error sending message', error);
      Alert.alert('Error', 'Failed to send message');
    } finally {
      setSendingMessage(false);
    }
  };

  const handleContactProvider = () => {
    if (booking?.providerPhone) {
      Alert.alert(
        'Contact Provider',
        `Call ${booking.providerPhone}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Call',
            onPress: () => {
              logger.info(TAG, 'Initiating call');
              // In real app, use: Linking.openURL(`tel:${booking.providerPhone}`);
              Alert.alert('Call', `Calling ${booking.providerPhone}...`);
            },
          },
        ]
      );
    }
  };

  const handleCompleteService = () => {
    Alert.alert(
      'Complete Service',
      'Mark this service as completed?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Complete',
          onPress: async () => {
            try {
              await api.put(`/bookings/${bookingId}`, { status: 'completed' });
              Alert.alert('Success', 'Service marked as completed');
              loadBookingDetails();
            } catch (error) {
              logger.error(TAG, 'Error completing service', error);
              Alert.alert('Error', 'Failed to complete service');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  if (!booking) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Booking not found</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.retryButtonText}>← Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Booking Details</Text>
        <View style={{ width: 50 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* ✅ Provider Info Card */}
        <View style={styles.providerCard}>
          <View style={styles.providerHeader}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>👤</Text>
            </View>
            <View style={styles.providerInfo}>
              <Text style={styles.providerName}>{booking.providerName}</Text>
              <Text style={styles.providerPhone}>{booking.providerPhone || 'Phone not provided'}</Text>
            </View>
          </View>

          <View style={styles.contactButtons}>
            <TouchableOpacity
              style={styles.contactButton}
              onPress={handleContactProvider}
              disabled={!booking.providerPhone}
            >
              <Text style={styles.contactIcon}>📞</Text>
              <Text style={styles.contactText}>Call</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.contactButton}>
              <Text style={styles.contactIcon}>💬</Text>
              <Text style={styles.contactText}>Message</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Service Details */}
        <View style={styles.detailsCard}>
          <Text style={styles.cardTitle}>Service Details</Text>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Amount:</Text>
            <Text style={styles.detailValue}>{formatters.currency(booking.agreedPrice)}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Status:</Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(booking.status) }]}>
              <Text style={styles.statusText}>{booking.status}</Text>
            </View>
          </View>

          {booking.createdAt && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Booked on:</Text>
              <Text style={styles.detailValue}>{formatters.date(booking.createdAt)}</Text>
            </View>
          )}
        </View>

        {/* ✅ Communication Section */}
        {booking.status === 'in-progress' || booking.status === 'confirmed' ? (
          <>
            <View style={styles.messagesCard}>
              <Text style={styles.cardTitle}>Messages</Text>

              {messages.length === 0 ? (
                <Text style={styles.noMessagesText}>No messages yet. Send one to get started!</Text>
              ) : (
                messages.map((msg, idx) => (
                  <View key={idx} style={[styles.message, msg.senderRole === 'user' && styles.userMessage]}>
                    <Text style={styles.messageText}>{msg.text}</Text>
                    <Text style={styles.messageTime}>{formatters.time(msg.createdAt)}</Text>
                  </View>
                ))
              )}

              <View style={styles.messageInput}>
                <TextInput
                  style={styles.input}
                  placeholder="Send a message..."
                  value={message}
                  onChangeText={setMessage}
                  multiline
                  numberOfLines={3}
                  placeholderTextColor="#999"
                  editable={!sendingMessage}
                />
                <TouchableOpacity
                  style={[styles.sendButton, sendingMessage && styles.buttonDisabled]}
                  onPress={handleSendMessage}
                  disabled={sendingMessage}
                >
                  <Text style={styles.sendIcon}>{sendingMessage ? '⏳' : '➤'}</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Complete Service Button */}
            {booking.status === 'in-progress' && (
              <TouchableOpacity
                style={styles.completeButton}
                onPress={handleCompleteService}
              >
                <Text style={styles.completeButtonText}>Mark Service Complete</Text>
              </TouchableOpacity>
            )}
          </>
        ) : (
          <View style={styles.infoBox}>
            <Text style={styles.infoIcon}>ℹ️</Text>
            <Text style={styles.infoText}>
              Once the provider accepts, you'll be able to communicate and track progress here.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    confirmed: '#4CAF50',
    'in-progress': '#FF9800',
    completed: '#4CAF50',
    cancelled: '#F44336',
    disputed: '#FF5722',
  };
  return colors[status] || '#999';
};

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
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  errorText: { color: '#999', fontSize: 16, marginBottom: 20 },
  retryButton: { backgroundColor: '#4CAF50', paddingHorizontal: 30, paddingVertical: 12, borderRadius: 10 },
  retryButtonText: { color: '#fff', fontWeight: '600' },
  content: { padding: 20 },
  providerCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  providerHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F0F9FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  avatarText: { fontSize: 30 },
  providerInfo: { flex: 1 },
  providerName: { fontSize: 18, fontWeight: '800', color: '#333', marginBottom: 4 },
  providerPhone: { fontSize: 14, color: '#666' },
  contactButtons: { flexDirection: 'row', gap: 10 },
  contactButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0F9FF',
    borderRadius: 12,
    padding: 12,
    gap: 6,
  },
  contactIcon: { fontSize: 18 },
  contactText: { fontSize: 14, fontWeight: '600', color: '#2196F3' },
  detailsCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#333', marginBottom: 15 },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  detailLabel: { fontSize: 14, color: '#666', fontWeight: '600' },
  detailValue: { fontSize: 14, color: '#333', fontWeight: '600' },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  statusText: { fontSize: 12, fontWeight: '700', color: '#fff', textTransform: 'uppercase' },
  messagesCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  noMessagesText: { fontSize: 14, color: '#999', textAlign: 'center', marginVertical: 20 },
  message: {
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    alignSelf: 'flex-start',
    maxWidth: '80%',
  },
  userMessage: { backgroundColor: '#4CAF50', alignSelf: 'flex-end' },
  messageText: { fontSize: 14, color: '#333' },
  messageTime: { fontSize: 11, color: '#999', marginTop: 4 },
  messageInput: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: '#333',
    backgroundColor: '#F8F9FA',
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonDisabled: { opacity: 0.6 },
  sendIcon: { fontSize: 18 },
  completeButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  completeButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
  },
  infoIcon: { fontSize: 20, marginRight: 10 },
  infoText: { flex: 1, fontSize: 14, color: '#1976D2', lineHeight: 20 },
});