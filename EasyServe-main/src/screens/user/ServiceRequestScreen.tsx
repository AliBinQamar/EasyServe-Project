// ============================================
// screens/user/ServiceRequestScreen.tsx - ENHANCED UX VERSION
// ============================================

import React, { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Pressable } from 'react-native';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { authService } from '../../services/authService';
import api from '../../config/api';
import { validators } from '../../utils/validators';
import { logger } from '../../utils/logger';
import { VALIDATION } from '../../utils/constants';

const TAG = 'ServiceRequestScreen';

export default function ServiceRequestScreen({ route, navigation }: any) {
  const { category } = route.params;
  const [description, setDescription] = useState('');
  const [isFixedPrice, setIsFixedPrice] = useState(false);
  const [serviceAddress, setServiceAddress] = useState('');
  const [fixedAmount, setFixedAmount] = useState('');
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    try {
      if (images.length >= 5) {
        Alert.alert('Limit Reached', 'You can upload a maximum of 5 photos.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.6,
      });

      if (!result.canceled && result.assets[0]) {
        const file = result.assets[0];
        setImages([
          ...images,
          {
            uri: file.uri,
            name: `image-${Date.now()}.jpg`,
            size: file.fileSize,
          },
        ]);
        logger.info(TAG, 'Image added to request');
      }
    } catch (error) {
      logger.error(TAG, 'Image picker error', error);
      Alert.alert('Error', 'Failed to select image. Please try again.');
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!description.trim()) {
      Alert.alert('Missing Details', 'Please describe the work you need done.');
      return;
    }

    if (description.length > VALIDATION.MAX_DESCRIPTION_LENGTH) {
      Alert.alert(
        'Too Long',
        `Your description is too long. Maximum ${VALIDATION.MAX_DESCRIPTION_LENGTH} characters allowed.`
      );
      return;
    }

    if (!serviceAddress.trim()) {
      Alert.alert('Missing Address', 'Please provide the service location address so the provider can reach you.');
      return;
    }

    if (isFixedPrice) {
      const priceValidation = validators.price(fixedAmount);
      if (!priceValidation.valid) {
        Alert.alert('Invalid Budget', priceValidation.error);
        return;
      }
    }

    setLoading(true);
    try {
      const user = await authService.getCurrentUser();
      if (!user) {
        Alert.alert('Not Logged In', 'Please log in to post a request.');
        navigation.navigate('Login');
        return;
      }

      logger.info(TAG, `Creating ${isFixedPrice ? 'fixed' : 'bidding'} request with ${images.length} images`);

      const requestData = {
        userId: user.id,
        userName: user.name,
        categoryId: category._id || category.id,
        categoryName: category.name,
        description: description.trim(),
        serviceAddress: serviceAddress.trim(),
        requestType: isFixedPrice ? 'fixed' : 'bidding',
        fixedAmount: isFixedPrice ? parseFloat(fixedAmount) : undefined,
        biddingEndDate: !isFixedPrice
          ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
          : undefined,
        images: images.map((img) => img.uri),
      };

      await api.post('/service-requests', requestData);

      logger.info(TAG, 'Request created successfully');
      Alert.alert(
        'Request Posted!',
        isFixedPrice
          ? 'Your service request has been posted with a fixed budget.'
          : 'Your service request is now open for provider offers.',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('MyRequests'),
          },
        ]
      );
    } catch (error: any) {
      logger.error(TAG, 'Request creation failed', error);
      const msg = error.response?.data?.message || 'Failed to create request. Please try again.';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = description.trim() && serviceAddress.trim() && (!isFixedPrice || fixedAmount.trim());

  return (
    <View style={styles.container}>
      {/* Modern Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButtonContainer}
            activeOpacity={0.7}
          >
            <Pressable onPress={() => navigation.goBack()}>
  <Ionicons name="arrow-back" size={26} color="#000" />
</Pressable>
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.title}>New Service Request</Text>
            <Text style={styles.subtitle}>{category.name}</Text>
          </View>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Category Badge - Enhanced */}
        <View style={styles.categoryCard}>
          <View style={styles.categoryIconContainer}>
            <Text style={styles.categoryIcon}>{category.icon || '🔧'}</Text>
          </View>
          <View style={styles.categoryInfo}>
            <Text style={styles.categoryLabel}>Service Category</Text>
            <Text style={styles.categoryName}>{category.name}</Text>
          </View>
        </View>

        {/* Step Indicator */}
        <View style={styles.stepContainer}>
          <View style={styles.stepItem}>
            <View style={[styles.stepNumber, description.trim() && styles.stepNumberComplete]}>
              <Text style={[styles.stepNumberText, description.trim() && styles.stepNumberTextComplete]}>1</Text>
            </View>
            <Text style={styles.stepLabel}>Describe</Text>
          </View>
          <View style={styles.stepLine} />
          <View style={styles.stepItem}>
            <View style={[styles.stepNumber, serviceAddress.trim() && styles.stepNumberComplete]}>
              <Text style={[styles.stepNumberText, serviceAddress.trim() && styles.stepNumberTextComplete]}>2</Text>
            </View>
            <Text style={styles.stepLabel}>Location</Text>
          </View>
          <View style={styles.stepLine} />
          <View style={styles.stepItem}>
            <View style={[styles.stepNumber, (isFixedPrice ? fixedAmount.trim() : true) && styles.stepNumberComplete]}>
              <Text style={[styles.stepNumberText, (isFixedPrice ? fixedAmount.trim() : true) && styles.stepNumberTextComplete]}>3</Text>
            </View>
            <Text style={styles.stepLabel}>Pricing</Text>
          </View>
        </View>

        {/* Section 1: Description */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIconContainer}>
              <Text style={styles.sectionIcon}>✍️</Text>
            </View>
            <View>
              <Text style={styles.sectionTitle}>Job Description</Text>
              <Text style={styles.sectionSubtitle}>What needs to be done?</Text>
            </View>
          </View>

          <View style={styles.inputCard}>
            <TextInput
              style={styles.textArea}
              placeholder="Describe the job in detail. Include specifics like materials, dimensions, timeline, or any special requirements..."
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              placeholderTextColor="#A0A0A0"
              editable={!loading}
            />
            <View style={styles.charCountContainer}>
              <Text style={[styles.charCount, description.length > VALIDATION.MAX_DESCRIPTION_LENGTH * 0.9 && styles.charCountWarning]}>
                {description.length}/{VALIDATION.MAX_DESCRIPTION_LENGTH}
              </Text>
            </View>
          </View>
        </View>

        {/* Section 2: Location */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIconContainer}>
              <Text style={styles.sectionIcon}>📍</Text>
            </View>
            <View>
              <Text style={styles.sectionTitle}>Service Location</Text>
              <Text style={styles.sectionSubtitle}>Where should providers go?</Text>
            </View>
          </View>

          <View style={styles.inputCard}>
            <TextInput
              style={styles.addressInput}
              placeholder="Complete address including street, area, and landmarks"
              value={serviceAddress}
              onChangeText={setServiceAddress}
              placeholderTextColor="#A0A0A0"
              editable={!loading}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>
        </View>

        {/* Section 3: Photos */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIconContainer}>
              <Text style={styles.sectionIcon}>📸</Text>
            </View>
            <View>
              <Text style={styles.sectionTitle}>Add Photos</Text>
              <Text style={styles.sectionSubtitle}>Optional • Helps providers understand better</Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.imagePickerCard, images.length >= 5 && styles.imagePickerDisabled]}
            onPress={pickImage}
            disabled={loading || images.length >= 5}
            activeOpacity={0.7}
          >
            <View style={styles.imagePickerContent}>
              <View style={styles.imagePickerIconContainer}>
                <Text style={styles.imagePickerIcon}>📷</Text>
              </View>
              <Text style={styles.imagePickerTitle}>
                {images.length >= 5 ? 'Photo Limit Reached' : 'Upload Photos'}
              </Text>
              <Text style={styles.imagePickerSubtitle}>
                {images.length}/5 photos • JPG, PNG
              </Text>
            </View>
          </TouchableOpacity>

          {images.length > 0 && (
            <View style={styles.imagesGrid}>
              {images.map((image, idx) => (
                <View key={idx} style={styles.imageCard}>
                  <Image source={{ uri: image.uri }} style={styles.thumbnail} />
                  <TouchableOpacity
                    style={styles.removeImageButton}
                    onPress={() => removeImage(idx)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.removeImageIcon}>✕</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Section 4: Pricing Type */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIconContainer}>
              <Text style={styles.sectionIcon}>💰</Text>
            </View>
            <View>
              <Text style={styles.sectionTitle}>Pricing Type</Text>
              <Text style={styles.sectionSubtitle}>Choose how you want to receive offers</Text>
            </View>
          </View>

          <View style={styles.priceTypeContainer}>
            <TouchableOpacity
              style={[styles.priceTypeCard, !isFixedPrice && styles.priceTypeCardActive]}
              onPress={() => setIsFixedPrice(false)}
              disabled={loading}
              activeOpacity={0.7}
            >
              <View style={[styles.priceTypeIconContainer, !isFixedPrice && styles.priceTypeIconActive]}>
                <Text style={styles.priceTypeIcon}>🎯</Text>
              </View>
              <Text style={[styles.priceTypeTitle, !isFixedPrice && styles.priceTypeTitleActive]}>
                Receive Bids
              </Text>
              <Text style={styles.priceTypeDescription}>
                Let providers compete with their best offers
              </Text>
              {!isFixedPrice && (
                <View style={styles.selectedBadge}>
                  <Text style={styles.selectedBadgeText}>✓ Selected</Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.priceTypeCard, isFixedPrice && styles.priceTypeCardActive]}
              onPress={() => setIsFixedPrice(true)}
              disabled={loading}
              activeOpacity={0.7}
            >
              <View style={[styles.priceTypeIconContainer, isFixedPrice && styles.priceTypeIconActive]}>
                <Text style={styles.priceTypeIcon}>💵</Text>
              </View>
              <Text style={[styles.priceTypeTitle, isFixedPrice && styles.priceTypeTitleActive]}>
                Fixed Budget
              </Text>
              <Text style={styles.priceTypeDescription}>
                Set your budget upfront for clarity
              </Text>
              {isFixedPrice && (
                <View style={styles.selectedBadge}>
                  <Text style={styles.selectedBadgeText}>✓ Selected</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {isFixedPrice && (
            <View style={styles.fixedPriceSection}>
              <Text style={styles.inputLabel}>Your Budget Amount</Text>
              <View style={styles.budgetInputContainer}>
                <Text style={styles.currencySymbol}>PKR</Text>
                <TextInput
                  style={styles.budgetInput}
                  placeholder="e.g., 5,000"
                  value={fixedAmount}
                  onChangeText={setFixedAmount}
                  keyboardType="numeric"
                  placeholderTextColor="#A0A0A0"
                  editable={!loading}
                />
              </View>
            </View>
          )}
        </View>

        {/* Info Banner */}
        <View style={styles.infoBanner}>
          <View style={styles.infoIconContainer}>
            <Text style={styles.infoIcon}>💡</Text>
          </View>
          <Text style={styles.infoText}>
            {isFixedPrice
              ? 'Providers can accept your budget or suggest adjustments based on their expertise.'
              : 'You\'ll receive multiple offers within 7 days. Compare and choose the best provider for your needs.'}
          </Text>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[
            styles.submitButton,
            loading && styles.submitButtonLoading,
            !isFormValid && styles.submitButtonDisabled
          ]}
          onPress={handleSubmit}
          disabled={loading || !isFormValid}
          activeOpacity={0.8}
        >
          {loading ? (
            <View style={styles.submitButtonLoading}>
              <ActivityIndicator color="#fff" size="small" />
              <Text style={styles.submitButtonTextLoading}>Posting Request...</Text>
            </View>
          ) : (
            <View style={styles.submitButtonContent}>
              <Text style={styles.submitButtonText}>Post Service Request</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    paddingBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 4,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  backButtonContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F7FA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 24,
    color: '#4CAF50',
    fontWeight: '600',
  },
  headerTextContainer: {
    flex: 1,
    marginLeft: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1A1A1A',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
    fontWeight: '500',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#E8F5E9',
  },
  categoryIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  categoryIcon: {
    fontSize: 32,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryLabel: {
    fontSize: 12,
    color: '#999',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  categoryName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1A1A1A',
    letterSpacing: -0.3,
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 32,
    paddingHorizontal: 10,
  },
  stepItem: {
    alignItems: 'center',
  },
  stepNumber: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  stepNumberComplete: {
    backgroundColor: '#4CAF50',
  },
  stepNumberText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#999',
  },
  stepNumberTextComplete: {
    color: '#fff',
  },
  stepLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#666',
  },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 8,
    marginBottom: 30,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionIcon: {
    fontSize: 22,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A1A1A',
    letterSpacing: -0.3,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
    fontWeight: '500',
  },
  inputCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 2,
    borderColor: '#F0F0F0',
  },
  textArea: {
    padding: 16,
    fontSize: 15,
    lineHeight: 22,
    minHeight: 140,
    color: '#1A1A1A',
    fontWeight: '500',
  },
  charCountContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    alignItems: 'flex-end',
  },
  charCount: {
    fontSize: 12,
    color: '#999',
    fontWeight: '600',
  },
  charCountWarning: {
    color: '#FF9800',
  },
  addressInput: {
    padding: 16,
    fontSize: 15,
    lineHeight: 22,
    minHeight: 100,
    color: '#1A1A1A',
    fontWeight: '500',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
    marginBottom: 10,
  },
  imagePickerCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
  },
  imagePickerDisabled: {
    opacity: 0.5,
  },
  imagePickerContent: {
    alignItems: 'center',
  },
  imagePickerIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F5F7FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  imagePickerIcon: {
    fontSize: 32,
  },
  imagePickerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  imagePickerSubtitle: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  imagesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 16,
    gap: 12,
  },
  imageCard: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
  },
  thumbnail: {
    width: 100,
    height: 100,
    borderRadius: 12,
  },
  removeImageButton: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F44336',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#F44336',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 4,
  },
  removeImageIcon: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
  },
  priceTypeContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  priceTypeCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    position: 'relative',
  },
  priceTypeCardActive: {
    borderColor: '#4CAF50',
    backgroundColor: '#F9FFF9',
  },
  priceTypeIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F5F7FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  priceTypeIconActive: {
    backgroundColor: '#E8F5E9',
  },
  priceTypeIcon: {
    fontSize: 28,
  },
  priceTypeTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#666',
    marginBottom: 6,
    textAlign: 'center',
  },
  priceTypeTitleActive: {
    color: '#4CAF50',
  },
  priceTypeDescription: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    lineHeight: 16,
    fontWeight: '500',
  },
  selectedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  selectedBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '800',
  },
  fixedPriceSection: {
    marginTop: 20,
  },
  budgetInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  currencySymbol: {
    fontSize: 16,
    fontWeight: '800',
    color: '#4CAF50',
    marginRight: 8,
  },
  budgetInput: {
    flex: 1,
    padding: 16,
    fontSize: 16,
    color: '#1A1A1A',
    fontWeight: '600',
  },
  infoBanner: {
    flexDirection: 'row',
    backgroundColor: '#FFF9E6',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#FFC107',
  },
  infoIconContainer: {
    marginRight: 12,
  },
  infoIcon: {
    fontSize: 22,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#8B6E00',
    lineHeight: 20,
    fontWeight: '500',
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  submitButtonDisabled: {
    backgroundColor: '#CCCCCC',
    shadowOpacity: 0.1,
  },
  submitButtonLoading: {
    opacity: 0.8,
  },
  submitButtonContent: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  submitButtonTextLoading: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 12,
  },
  submitButtonIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  submitButtonIcon: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
  },
  bottomSpacer: {
    height: 20,
  },
  arrow: {
    fontSize: 22,
    fontWeight: '700',
    color: '#000',
  },
});