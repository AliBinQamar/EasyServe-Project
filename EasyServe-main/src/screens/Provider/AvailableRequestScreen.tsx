// ============================================
// screens/Provider/AvailableRequestScreen.tsx
// ============================================

import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { authService } from '../../services/authService';
import api from '../../config/api';
import { Provider } from '../../types';
import { logger } from '../../utils/logger';
import { requestService } from '../../services/requestService';
const TAG = 'AvailableRequestScreen';

interface Request {
  _id: string;
  userId: string;
  userName: string;
  categoryId: string;
  categoryName: string;
  description: string;
  requestType: 'fixed' | 'bidding';
  fixedAmount?: number;
  status: 'open' | 'bidding' | 'assigned' | 'in-progress' | 'completed';
  createdAt: string;
}

export default function AvailableRequestScreen({ navigation }: any) {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [bidModalVisible, setBidModalVisible] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [bidAmount, setBidAmount] = useState('');
  const [bidNote, setBidNote] = useState('');
  const [attachments, setAttachments] = useState<any[]>([]);
  const [provider, setProvider] = useState<Provider | null>(null);

  useEffect(() => {
    loadRequests();
    return () => {
      setRequests([]);
      setAttachments([]);
    };
  }, []);

  const loadRequests = async () => {
    try {
      const currentProvider = await authService.getCurrentUser();
      if (!currentProvider || currentProvider.role !== 'provider') {
        Alert.alert('Error', 'Provider information not found');
        return;
      }
      setProvider(currentProvider as Provider);

      const res = await api.get('/service-requests');

      const filteredRequests = (res.data || []).filter(
        (req: Request) =>
          req.categoryId === (currentProvider as Provider).categoryId &&
          (req.requestType === 'bidding' || req.requestType === 'fixed') &&
          (req.status === 'open' || req.status === 'bidding')
      );

      logger.info(TAG, `Loaded ${filteredRequests.length} matching requests`);
      setRequests(filteredRequests);
    } catch (error) {
      logger.error(TAG, 'Error loading requests', error);
      Alert.alert('Error', 'Failed to load requests');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadRequests();
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.6,
      });

      if (!result.canceled && result.assets[0]) {
        const file = result.assets[0];
        setAttachments([
          ...attachments,
          {
            uri: file.uri,
            type: 'image',
            name: `bid-image-${Date.now()}.jpg`,
            size: file.fileSize,
          },
        ]);
      }
    } catch (error) {
      logger.error(TAG, 'Image picker error', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const handleOpenBidModal = (request: Request) => {
    setSelectedRequest(request);
    setBidAmount('');
    setBidNote('');
    setAttachments([]);
    setBidModalVisible(true);
  };

  const handleSubmitBid = async () => {
    if (!bidAmount || parseFloat(bidAmount) <= 0) {
      Alert.alert('Error', 'Please enter a valid bid amount');
      return;
    }

    if (!provider) {
      Alert.alert('Error', 'Provider not found');
      return;
    }

    setLoading(true);
    try {
      const existingBids = await api.get(
        `/service-requests/${selectedRequest?._id}/bids`
      );

      const alreadyBid = existingBids.data.some(
        (bid: any) => bid.providerId === provider.id
      );

      if (alreadyBid) {
        Alert.alert('Error', 'You have already placed a bid on this request');
        return;
      }

      await api.post('/service-requests/bid', {
        serviceRequestId: selectedRequest?._id,
        providerId: provider.id,
        providerName: provider.name,
        proposedAmount: parseFloat(bidAmount),
        note: bidNote.trim() || '',
        attachments: attachments,
      });

      logger.info(TAG, 'Bid submitted successfully');
      Alert.alert('Success', 'Your bid has been submitted!');
      closeBidModal();
      loadRequests();
    } catch (error: any) {
      logger.error(TAG, 'Bid submission error', error);
      const msg = error.response?.data?.message || 'Failed to submit bid';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

 const handleAcceptFixedRequest = async (requestId: string) => {
  if (!provider) {
    Alert.alert('Error', 'Provider information not found');
    return;
  }

  try {
    setLoading(true);

    // Use the service method
    await requestService.acceptFixedRequest({
      requestId,
      providerId: provider.id,
      providerName: provider.name,
    });

    Alert.alert('Success', 'You have accepted the fixed price request!');
    closeBidModal();
    loadRequests();
  } catch (error: any) {
    const msg = error.response?.data?.message || 'Failed to accept request';
    Alert.alert('Error', msg);
  } finally {
    setLoading(false);
  }
};

  const closeBidModal = () => {
    setBidModalVisible(false);
    setSelectedRequest(null);
    setBidAmount('');
    setBidNote('');
    setAttachments([]);
  };

  const removeAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Available Requests</Text>
        <View style={{ width: 50 }} />
      </View>

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#2196F3" />
          <Text style={styles.loadingText}>Loading requests...</Text>
        </View>
      ) : requests.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📭</Text>
          <Text style={styles.emptyText}>No requests available</Text>
          <Text style={styles.emptySubtext}>
            Check back soon for new service requests
          </Text>
        </View>
      ) : (
        <FlatList
          data={requests}
          keyExtractor={(item) => item._id}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#2196F3']}
            />
          }
          renderItem={({ item }) => (
            <View style={styles.requestCard}>
              <View style={styles.cardHeader}>
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryText}>{item.categoryName}</Text>
                </View>
                <View style={styles.biddingBadge}>
                  <Text style={styles.biddingText}>
                    {item.requestType === 'bidding' ? '🎯 Bidding' : '💰 Fixed'}
                  </Text>
                </View>
              </View>

              <Text style={styles.userName}>👤 {item.userName}</Text>
              <Text style={styles.description} numberOfLines={3}>
                {item.description}
              </Text>

              {item.fixedAmount && (
                <View style={styles.priceTag}>
                  <Text style={styles.priceLabel}>Budget:</Text>
                  <Text style={styles.priceValue}>Rs. {item.fixedAmount}</Text>
                </View>
              )}

              <View style={styles.cardFooter}>
                <Text style={styles.dateText}>
                  {new Date(item.createdAt).toLocaleDateString()}
                </Text>
                <TouchableOpacity
                  style={styles.bidButton}
                  onPress={() => handleOpenBidModal(item)}
                >
                  <Text style={styles.bidButtonText}>
                    {item.requestType === 'bidding' ? 'Place Bid →' : 'Accept →'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          contentContainerStyle={styles.list}
        />
      )}

      {/* Bid / Fixed Modal */}
      <Modal
        visible={bidModalVisible}
        animationType="slide"
        transparent
        onRequestClose={closeBidModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Request Details</Text>
              <TouchableOpacity onPress={closeBidModal}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            {selectedRequest && (
              <>
                <View style={styles.requestPreview}>
                  <Text style={styles.previewCategory}>
                    {selectedRequest.categoryName}
                  </Text>
                  <Text style={styles.previewDescription} numberOfLines={2}>
                    {selectedRequest.description}
                  </Text>
                  {selectedRequest.fixedAmount && (
                    <Text style={styles.previewBudget}>
                      Client Budget: Rs. {selectedRequest.fixedAmount}
                    </Text>
                  )}
                </View>

                {selectedRequest.requestType === 'bidding' ? (
                  <>
                    <Text style={styles.inputLabel}>Your Bid Amount (Rs.)</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Enter your bid amount"
                      value={bidAmount}
                      onChangeText={setBidAmount}
                      keyboardType="numeric"
                      placeholderTextColor="#999"
                    />

                    <Text style={styles.inputLabel}>Add a Note (Optional)</Text>
                    <TextInput
                      style={styles.textArea}
                      placeholder="Why should they choose you?"
                      value={bidNote}
                      onChangeText={setBidNote}
                      multiline
                      numberOfLines={4}
                      textAlignVertical="top"
                      placeholderTextColor="#999"
                    />

                    <TouchableOpacity
                      style={styles.imageButton}
                      onPress={pickImage}
                      disabled={attachments.length >= 5}
                    >
                      <Text style={styles.imageIcon}>📎</Text>
                      <Text style={styles.imageText}>
                        Add Images ({attachments.length}/5)
                      </Text>
                    </TouchableOpacity>

                    {attachments.length > 0 && (
                      <View style={styles.attachmentsList}>
                        {attachments.map((att, idx) => (
                          <View key={idx} style={styles.attachment}>
                            <Text style={styles.attachmentName}>{att.name}</Text>
                            <TouchableOpacity onPress={() => removeAttachment(idx)}>
                              <Text style={styles.removeIcon}>✕</Text>
                            </TouchableOpacity>
                          </View>
                        ))}
                      </View>
                    )}
                  </>
                ) : (
                  <Text style={{ marginBottom: 15 }}>
                    This is a fixed price request. Budget: Rs. {selectedRequest.fixedAmount}
                  </Text>
                )}

                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={closeBidModal}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.submitButton}
                    onPress={async () => {
                      if (selectedRequest.requestType === 'fixed') {
                        await handleAcceptFixedRequest(selectedRequest._id);
                      } else {
                        await handleSubmitBid();
                      }
                    }}
                    disabled={loading}
                  >
                    <Text style={styles.submitButtonText}>
                      {loading
                        ? 'Submitting...'
                        : selectedRequest.requestType === 'fixed'
                        ? 'Accept Request'
                        : 'Submit Bid'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
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
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyIcon: { fontSize: 80, marginBottom: 20 },
  emptyText: { fontSize: 20, fontWeight: '700', color: '#333', marginBottom: 8 },
  emptySubtext: { fontSize: 15, color: '#999', textAlign: 'center' },
  list: { padding: 20 },
  requestCard: {
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
  biddingBadge: { backgroundColor: '#F3E5F5', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  biddingText: { fontSize: 12, fontWeight: '700', color: '#7B1FA2' },
  userName: { fontSize: 14, fontWeight: '600', color: '#666', marginBottom: 8 },
  description: { fontSize: 15, color: '#333', lineHeight: 22, marginBottom: 12 },
  priceTag: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F0FDF4', padding: 10, borderRadius: 10, marginBottom: 12, gap: 5 },
  priceLabel: { fontSize: 13, color: '#666', fontWeight: '600' },
  priceValue: { fontSize: 18, fontWeight: '800', color: '#4CAF50' },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dateText: { fontSize: 12, color: '#999' },
  bidButton: { backgroundColor: '#2196F3', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20 },
  bidButtonText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 25, maxHeight: '95%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 24, fontWeight: '800', color: '#333' },
  closeButton: { fontSize: 24, color: '#999', fontWeight: '700' },
  requestPreview: { backgroundColor: '#F8F9FA', borderRadius: 12, padding: 15, marginBottom: 20 },
  previewCategory: { fontSize: 13, fontWeight: '700', color: '#1976D2', marginBottom: 8 },
  previewDescription: { fontSize: 14, color: '#333', lineHeight: 20, marginBottom: 8 },
  previewBudget: { fontSize: 14, fontWeight: '700', color: '#4CAF50' },
  inputLabel: { fontSize: 15, fontWeight: '700', color: '#333', marginBottom: 8, marginTop: 10 },
  input: { backgroundColor: '#F8F9FA', borderRadius: 12, padding: 15, fontSize: 16, borderWidth: 1, borderColor: '#E0E0E0', marginBottom: 15, color: '#333' },
  textArea: { backgroundColor: '#F8F9FA', borderRadius: 12, padding: 15, fontSize: 15, minHeight: 100, borderWidth: 1, borderColor: '#E0E0E0', marginBottom: 15, color: '#333' },
  imageButton: { flexDirection: 'row', alignItems: 'center', padding: 15, backgroundColor: '#F8F9FA', borderRadius: 12, marginBottom: 15, borderWidth: 1, borderColor: '#E0E0E0' },
  imageIcon: { fontSize: 20, marginRight: 10 },
  imageText: { fontSize: 15, color: '#333', fontWeight: '600' },
  attachmentsList: { marginBottom: 15, gap: 10 },
  attachment: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F0FDF4', padding: 12, borderRadius: 10 },
  attachmentName: { fontSize: 14, color: '#333', flex: 1 },
  removeIcon: { fontSize: 16, color: '#F44336', fontWeight: '700' },
  modalButtons: { flexDirection: 'row', gap: 12 },
  cancelButton: { flex: 1, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#E0E0E0', alignItems: 'center' },
  cancelButtonText: { fontSize: 16, fontWeight: '700', color: '#666' },
  submitButton: { flex: 1, backgroundColor: '#2196F3', padding: 16, borderRadius: 12, alignItems: 'center' },
  submitButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});