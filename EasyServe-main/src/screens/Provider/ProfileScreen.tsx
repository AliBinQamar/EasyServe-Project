// ============================================
// screens/user/ProfileScreen.tsx - NEW
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
import { authService } from '../../services/authService';
import { profileService } from '../../services/profileService';
import { AuthUser } from '../../types';
import { logger } from '../../utils/logger';
import { validators } from '../../utils/validators';

const TAG = 'ProfileScreen';

export default function ProfileScreen({ navigation }: any) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const profile = await profileService.getProfile();
      setUser(profile);
      setFormData(profile || {});
      logger.info(TAG, 'Profile loaded');
    } catch (error) {
      logger.error(TAG, 'Failed to load profile', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.name?.trim()) {
      Alert.alert('Error', 'Name cannot be empty');
      return;
    }

    if (!validators.name(formData.name)) {
      Alert.alert('Error', 'Name must be at least 2 characters');
      return;
    }

    if (formData.phone && !validators.phone(formData.phone)) {
      Alert.alert('Error', 'Please enter a valid phone number');
      return;
    }

    setLoading(true);
    try {
      const updated = await profileService.updateProfile({
        ...formData,
      });

      if (updated) {
        setUser(updated);
        setEditing(false);
        logger.info(TAG, 'Profile updated successfully');
        Alert.alert('Success', 'Profile updated successfully!');
      }
    } catch (error: any) {
      logger.error(TAG, 'Profile update failed', error);
      const msg = error.message || 'Failed to update profile';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Profile not found</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={loadProfile}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
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
        <Text style={styles.title}>My Profile</Text>
        <TouchableOpacity onPress={() => setEditing(!editing)}>
          <Text style={styles.editButton}>{editing ? 'Cancel' : 'Edit'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>👤</Text>
          </View>
          <Text style={styles.name}>{user.name}</Text>
          <Text style={styles.email}>{user.email}</Text>
          {user.phone && <Text style={styles.phone}>📞 {user.phone}</Text>}
          <View style={styles.roleBadge}>
            <Text style={styles.roleBadgeText}>
              {user.role === 'provider' ? '🔧 Service Provider' : '👤 Client'}
            </Text>
          </View>
        </View>

        {editing ? (
          <View style={styles.editForm}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={styles.input}
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
              placeholder="Full Name"
              placeholderTextColor="#999"
            />

            <Text style={styles.label}>Email</Text>
            <TextInput
              style={[styles.input, styles.disabledInput]}
              value={formData.email}
              editable={false}
              placeholder="Email (Cannot change)"
              placeholderTextColor="#999"
            />

            <Text style={styles.label}>Phone</Text>
            <TextInput
              style={styles.input}
              value={formData.phone}
              onChangeText={(text) => setFormData({ ...formData, phone: text })}
              placeholder="Phone Number"
              keyboardType="phone-pad"
              placeholderTextColor="#999"
            />

            {user.role === 'provider' && (
              <>
                <Text style={styles.label}>Service Description</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={formData.description}
                  onChangeText={(text) =>
                    setFormData({ ...formData, description: text })
                  }
                  placeholder="About your services"
                  multiline
                  numberOfLines={4}
                  placeholderTextColor="#999"
                />

                <Text style={styles.label}>Base Price (Rs.)</Text>
                <TextInput
                  style={styles.input}
                  value={formData.price?.toString()}
                  onChangeText={(text) =>
                    setFormData({
                      ...formData,
                      price: parseInt(text) || 0,
                    })
                  }
                  placeholder="Base Price"
                  keyboardType="numeric"
                  placeholderTextColor="#999"
                />

                <Text style={styles.label}>Service Area</Text>
                <TextInput
                  style={styles.input}
                  value={formData.area}
                  onChangeText={(text) =>
                    setFormData({ ...formData, area: text })
                  }
                  placeholder="Service Area"
                  placeholderTextColor="#999"
                />
              </>
            )}

            <TouchableOpacity
              style={[styles.saveButton, loading && styles.buttonDisabled]}
              onPress={handleSave}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.saveButtonText}>Save Changes</Text>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Email:</Text>
              <Text style={styles.infoValue}>{user.email}</Text>
            </View>
            {user.phone && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Phone:</Text>
                <Text style={styles.infoValue}>{user.phone}</Text>
              </View>
            )}
            {user.role === 'provider' && (
              <>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Category:</Text>
                  <Text style={styles.infoValue}>{(user as any).categoryName}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Area:</Text>
                  <Text style={styles.infoValue}>{(user as any).area}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Base Price:</Text>
                  <Text style={styles.infoValue}>Rs. {(user as any).price}</Text>
                </View>
              </>
            )}
          </View>
        )}
      </ScrollView>
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
  backButton: { color: '#4CAF50', fontWeight: '600', fontSize: 16 },
  editButton: { color: '#4CAF50', fontWeight: '600', fontSize: 16 },
  title: { fontSize: 20, fontWeight: '800', color: '#333' },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  errorText: { color: '#999', fontSize: 16, marginBottom: 20 },
  retryButton: { backgroundColor: '#4CAF50', paddingHorizontal: 30, paddingVertical: 12, borderRadius: 10 },
  retryButtonText: { color: '#fff', fontWeight: '600' },
  content: { padding: 20 },
  profileCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 30,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  avatarText: { fontSize: 40 },
  name: { fontSize: 24, fontWeight: '800', color: '#333', marginBottom: 5 },
  email: { fontSize: 15, color: '#666', marginBottom: 5 },
  phone: { fontSize: 14, color: '#999', marginBottom: 15 },
  roleBadge: { backgroundColor: '#F0FDF4', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, marginTop: 10 },
  roleBadgeText: { color: '#4CAF50', fontWeight: '600', fontSize: 14 },
  editForm: { backgroundColor: '#fff', borderRadius: 16, padding: 20, marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '700', color: '#333', marginTop: 15, marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 15,
    fontSize: 15,
    color: '#333',
    backgroundColor: '#F8F9FA',
  },
  disabledInput: { backgroundColor: '#f0f0f0', color: '#999' },
  textArea: { minHeight: 100, textAlignVertical: 'top' },
  saveButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
    alignItems: 'center',
  },
  buttonDisabled: { opacity: 0.6 },
  saveButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoLabel: { fontSize: 14, color: '#666', fontWeight: '600', flex: 0.4 },
  infoValue: { fontSize: 14, color: '#333', fontWeight: '600', flex: 0.6, textAlign: 'right' },
});