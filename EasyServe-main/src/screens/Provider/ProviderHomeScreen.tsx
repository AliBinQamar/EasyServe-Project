import React, { useEffect, useState } from 'react';
import {
  Alert,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { authService } from '../../services/authService';
import api from '../../config/api';
import { logger } from '../../utils/logger';
import { Provider as ProviderType } from '../../types';

const TAG = 'ProviderHomeScreen';
const { width } = Dimensions.get('window');

interface ProviderStats {
  activeBids: number;
  acceptedBids: number;
  completedJobs: number;
  rating: number;
}

export default function ProviderHomeScreen({ navigation }: any) {
  const [userName, setUserName] = useState('');
  const [stats, setStats] = useState<ProviderStats>({
    activeBids: 0,
    acceptedBids: 0,
    completedJobs: 0,
    rating: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const user = (await authService.getCurrentUser()) as ProviderType;
      if (user) {
        setUserName(user.name.split(' ')[0]);
        setStats((prev) => ({ ...prev, rating: user.rating || 0 }));

        logger.info(TAG, `Loaded provider: ${user.name}`);

        const bidsRes = await api.get(
          `/service-requests/provider-bids/${user.id}`
        );

        const activeBids = (bidsRes.data || []).filter(
          (b: any) => b.status === 'pending'
        ).length;
        const acceptedBids = (bidsRes.data || []).filter(
          (b: any) => b.status === 'accepted'
        ).length;

        setStats((prev) => ({ ...prev, activeBids, acceptedBids }));
        logger.info(TAG, `Stats: ${activeBids} active, ${acceptedBids} accepted`);
      }
    } catch (error) {
      logger.error(TAG, 'Error loading data', error);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await authService.logout();
              logger.info(TAG, 'Provider logged out');
              navigation.replace('Login');
            } catch (error) {
              logger.error(TAG, 'Logout failed', error);
              Alert.alert('Error', 'Logout failed. Please try again.');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome back, {userName}! 👋</Text>
          <Text style={styles.subtitle}>Your Provider Dashboard</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutIcon}>🚪</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statIcon}>💰</Text>
          <Text style={styles.statValue}>{stats.activeBids}</Text>
          <Text style={styles.statLabel}>Active Bids</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statIcon}>✓</Text>
          <Text style={styles.statValue}>{stats.acceptedBids}</Text>
          <Text style={styles.statLabel}>Accepted</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statIcon}>⭐</Text>
          <Text style={styles.statValue}>{stats.rating.toFixed(1)}</Text>
          <Text style={styles.statLabel}>Rating</Text>
        </View>
      </View>

      <View style={styles.menuContainer}>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate('AvailableRequests')}
        >
          <View style={styles.menuIconContainer}>
            <Text style={styles.menuIcon}>🔍</Text>
          </View>
          <View style={styles.menuContent}>
            <Text style={styles.menuTitle}>Available Requests</Text>
            <Text style={styles.menuSubtitle}>Find new opportunities</Text>
          </View>
          <Text style={styles.menuArrow}>→</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate('MyBids')}
        >
          <View style={styles.menuIconContainer}>
            <Text style={styles.menuIcon}>📋</Text>
          </View>
          <View style={styles.menuContent}>
            <Text style={styles.menuTitle}>My Bids</Text>
            <Text style={styles.menuSubtitle}>Track your submitted bids</Text>
          </View>
          <Text style={styles.menuArrow}>→</Text>
        </TouchableOpacity>
        {/* ✅ New Menu Item for Provider Bookings */}
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate('ProviderBookings')}
        >
          <View style={styles.menuIconContainer}>
            <Text style={styles.menuIcon}>📂</Text>
          </View>
          <View style={styles.menuContent}>
            <Text style={styles.menuTitle}>My Bookings</Text>
            <Text style={styles.menuSubtitle}>View accepted jobs & track progress</Text>
          </View>
          <Text style={styles.menuArrow}>→</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate('Wallet')}
        >
          <View style={styles.menuIconContainer}>
            <Text style={styles.menuIcon}>💳</Text>
          </View>
          <View style={styles.menuContent}>
            <Text style={styles.menuTitle}>Wallet</Text>
            <Text style={styles.menuSubtitle}>Manage your earnings</Text>
          </View>
          <Text style={styles.menuArrow}>→</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate('Profile')}
        >
          <View style={styles.menuIconContainer}>
            <Text style={styles.menuIcon}>👤</Text>
          </View>
          <View style={styles.menuContent}>
            <Text style={styles.menuTitle}>My Profile</Text>
            <Text style={styles.menuSubtitle}>View & edit your profile</Text>
          </View>
          <Text style={styles.menuArrow}>→</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: {
    backgroundColor: '#2196F3',
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
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: -25,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  statIcon: { fontSize: 28, marginBottom: 8 },
  statValue: { fontSize: 20, fontWeight: '800', color: '#333', marginBottom: 4 },
  statLabel: { fontSize: 12, color: '#666', fontWeight: '600' },
  menuContainer: { padding: 20, marginTop: 10 },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  menuIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F0F9FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  menuIcon: { fontSize: 24 },
  menuContent: { flex: 1 },
  menuTitle: { fontSize: 16, fontWeight: '700', color: '#333', marginBottom: 4 },
  menuSubtitle: { fontSize: 13, color: '#666' },
  menuArrow: { fontSize: 20, color: '#2196F3', fontWeight: '700' },
});
