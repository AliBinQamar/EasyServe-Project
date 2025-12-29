// ============================================
// screens/user/HomeScreen.tsx - FIXED
// ============================================

import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { authService } from '../../services/authService';
import { categoryService } from '../../services/categoryService';
import { Category } from '../../types';
import { logger } from '../../utils/logger';

const TAG = 'HomeScreen';
const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 60) / 2;

export default function HomeScreen({ navigation }: any) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    loadData();
    return () => {
      setCategories([]);
    };
  }, []);

  const loadData = async () => {
    try {
      const user = await authService.getCurrentUser();
      if (user) {
        setUserName(user.name.split(' ')[0]);
        logger.info(TAG, `Loaded user: ${user.name}`);
      }

      const data = await categoryService.getAll();
      setCategories(data);
      logger.info(TAG, `Loaded ${data.length} categories`);
    } catch (error) {
      logger.error(TAG, 'Error loading data', error);
      Alert.alert('Error', 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          try {
            await authService.logout();
            logger.info(TAG, 'Logged out successfully');
            navigation.replace('Login');
          } catch (error) {
            logger.error(TAG, 'Logout failed', error);
            Alert.alert('Error', 'Logout failed. Please try again.');
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, {userName}! 👋</Text>
          <Text style={styles.subtitle}>What service do you need?</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutIcon}>🚪</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.quickActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('MyRequests')}
        >
          <Text style={styles.actionIcon}>📝</Text>
          <Text style={styles.actionText}>My Requests</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.actionButtonSecondary]}
          onPress={() => navigation.navigate('MyBookings')}
        >
          <Text style={styles.actionIcon}>📋</Text>
          <Text style={styles.actionText}>My Bookings</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Browse Categories</Text>

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
        </View>
      ) : (
        <FlatList
          data={categories}
          keyExtractor={(item, index) => item._id?.toString() || item.id?.toString() || `cat-${index}`}
          numColumns={2}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const categoryId = item._id?.toString() || item.id?.toString();

            return (
              <TouchableOpacity
                style={styles.categoryCard}
                onPress={() => {
                  if (!categoryId) {
                    Alert.alert('Error', 'This category cannot be opened');
                    return;
                  }
                  navigation.navigate('ProviderList', {
                    categoryId,
                    categoryName: item.name,
                  });
                }}
              >
                <View style={styles.iconWrapper}>
                  <Text style={styles.categoryIcon}>{item.icon || '🔧'}</Text>
                </View>
                <Text style={styles.categoryName}>{item.name}</Text>
                <View style={styles.arrowContainer}>
                  <Text style={styles.arrow}>→</Text>
                </View>
              </TouchableOpacity>
            );
          }}
          contentContainerStyle={styles.categoryList}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: {
    backgroundColor: '#4CAF50',
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  greeting: { fontSize: 28, fontWeight: '800', color: '#fff', marginBottom: 5 },
  subtitle: { fontSize: 15, color: 'rgba(255,255,255,0.9)', fontWeight: '500' },
  logoutButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutIcon: { fontSize: 24 },
  quickActions: { flexDirection: 'row', paddingHorizontal: 20, marginTop: -25, gap: 15 },
  actionButton: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  actionButtonSecondary: { borderLeftColor: '#FF9800' },
  actionIcon: { fontSize: 32, marginBottom: 8 },
  actionText: { fontSize: 14, fontWeight: '700', color: '#333' },
  sectionTitle: { fontSize: 22, fontWeight: '800', color: '#333', paddingHorizontal: 20, marginTop: 30, marginBottom: 15 },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  categoryList: { paddingHorizontal: 12, paddingBottom: 30 },
  categoryCard: {
    width: CARD_WIDTH,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    margin: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    position: 'relative',
  },
  iconWrapper: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#F0F9FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    alignSelf: 'center',
  },
  categoryIcon: { fontSize: 36 },
  categoryName: { fontSize: 15, fontWeight: '700', color: '#333', textAlign: 'center', marginBottom: 10 },
  arrowContainer: {
    position: 'absolute',
    bottom: 15,
    right: 15,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrow: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
