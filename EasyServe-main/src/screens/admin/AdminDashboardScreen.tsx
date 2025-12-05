import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { authService } from '../../services/authService';
import { statsService, Stats } from '../../services/statsService';
const Theme = {
  PRIMARY_BLUE: '#1F3A93',
  ACCENT_RED: '#FF6B6B',
  BACKGROUND_LIGHT: '#F0F5F9',
  SURFACE_WHITE: '#FFFFFF',
  TEXT_DARK: '#2C3E50',
  TEXT_LIGHT: '#7F8C8D',
  SHADOW_COLOR: '#000',
  BORDER_RADIUS: 10,
  PADDING_HORIZONTAL: 20,
  ELEVATION_BASE: 5,
};
export default function AdminDashboardScreen({ navigation }: { navigation: any }) {
  const [stats, setStats] = useState<Stats>({
    users: 0,
    providers: 0,
    bookings: 0,
    categories: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await statsService.getStats();
      setStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await authService.logout();
    navigation.replace('AdminLogin');
  };

  const StatCard = ({ title, value, icon, color }: any) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <Text style={styles.statIcon}>{icon}</Text>
      <View style={styles.statInfo}>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statTitle}>{title}</Text>
      </View>
    </View>
  );

  const MenuButton = ({ title, icon, onPress, color }: any) => (
    <TouchableOpacity style={styles.menuButton} onPress={onPress}>
      <View style={[styles.menuIcon, { backgroundColor: color }]}>
        <Text style={styles.menuIconText}>{icon}</Text>
      </View>
      <Text style={styles.menuText}>{title}</Text>
      <Text style={styles.menuArrow}>→</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Admin Dashboard</Text>
          <Text style={styles.subtitle}>Manage your platform</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Stats Section */}
      <View style={styles.statsContainer}>
        <StatCard title="Total Users" value={stats.users} icon="👥" color="#4CAF50" />
        <StatCard title="Providers" value={stats.providers} icon="🔧" color="#2196F3" />
        <StatCard title="Bookings" value={stats.bookings} icon="📋" color="#FF9800" />
        <StatCard title="Categories" value={stats.categories} icon="📂" color="#9C27B0" />
      </View>

      {/* Menu Section */}
      <View style={styles.menuContainer}>
        <Text style={styles.sectionTitle}>Admin Tools</Text>

        <MenuButton
          title="Manage Providers"
          icon="🔧"
          onPress={() => navigation.navigate('ManageProviders')}
          color="#2196F3"
        />

        <MenuButton
          title="Manage Bookings"
          icon="📋"
          onPress={() => navigation.navigate('ManageBookings')}
          color="#FF9800"
        />

        <MenuButton
          title="Manage Categories"
          icon="📂"
          onPress={() => navigation.navigate('ManageCategories')}
          color="#9C27B0"
        />
      </View>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5', // slightly lighter background for contrast
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 3,
  },
  greeting: {
    fontSize: 26,
    fontWeight: '700',
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    color: '#777',
    marginTop: 4,
  },
  logoutButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  logoutText: {
    color: '#f44336', // red logout for attention
    fontSize: 14,
    fontWeight: '600',
  },
  statsContainer: {
    padding: 20,
    gap: 15,
  },
  statCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    borderLeftWidth: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  statIcon: {
    fontSize: 36,
    marginRight: 15,
  },
  statInfo: {
    justifyContent: 'center',
  },
  statValue: {
    fontSize: 26,
    fontWeight: '700',
    color: '#333',
  },
  statTitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  menuContainer: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 15,
  },
  menuButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  menuIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  menuIconText: {
    fontSize: 22,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  menuArrow: {
    fontSize: 20,
    color: '#999',
  },
});
