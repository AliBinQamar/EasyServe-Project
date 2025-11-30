import { collection, getDocs } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { auth, db } from '../../config/firebase';
import { profileCache } from '../../storage/asyncProfileCache';

export default function AdminDashboardScreen({ navigation }: any) {
    const [stats, setStats] = useState({
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
            const usersSnap = await getDocs(collection(db, 'users'));
            const providersSnap = await getDocs(collection(db, 'providers'));
            const bookingsSnap = await getDocs(collection(db, 'bookings'));
            const categoriesSnap = await getDocs(collection(db, 'categories'));

            setStats({
                users: usersSnap.size,
                providers: providersSnap.size,
                bookings: bookingsSnap.size,
                categories: categoriesSnap.size,
            });
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await auth.signOut();
        await profileCache.clear();
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
                <ActivityIndicator size="large" color="#2196F3" />
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.greeting}>Admin Dashboard</Text>
                    <Text style={styles.subtitle}>Manage your platform</Text>
                </View>
                <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
                    <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.statsContainer}>
                <StatCard title="Total Users" value={stats.users} icon="👥" color="#4CAF50" />
                <StatCard title="Providers" value={stats.providers} icon="🔧" color="#2196F3" />
                <StatCard title="Bookings" value={stats.bookings} icon="📋" color="#FF9800" />
                <StatCard title="Categories" value={stats.categories} icon="📂" color="#9C27B0" />
            </View>

            <View style={styles.menuContainer}>
                <Text style={styles.sectionTitle}>Management</Text>

                <MenuButton
                    title="Manage Categories"
                    icon="📂"
                    color="#9C27B0"
                    onPress={() => navigation.navigate('ManageCategories')}
                />
                <MenuButton
                    title="Manage Providers"
                    icon="🔧"
                    color="#2196F3"
                    onPress={() => navigation.navigate('ManageProviders')}
                />
                <MenuButton
                    title="View Bookings"
                    icon="📋"
                    color="#FF9800"
                    onPress={() => navigation.navigate('ViewBookings')}
                />
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
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
        padding: 20,
        paddingTop: 60,
        backgroundColor: '#fff',
    },
    greeting: {
        fontSize: 24,
        fontWeight: '700',
        color: '#333',
    },
    subtitle: {
        fontSize: 14,
        color: '#666',
        marginTop: 4,
    },
    logoutButton: {
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    logoutText: {
        color: '#666',
        fontSize: 14,
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
        borderLeftWidth: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    statIcon: {
        fontSize: 40,
        marginRight: 15,
    },
    statInfo: {
        justifyContent: 'center',
    },
    statValue: {
        fontSize: 28,
        fontWeight: '700',
        color: '#333',
    },
    statTitle: {
        fontSize: 14,
        color: '#666',
        marginTop: 4,
    },
    menuContainer: {
        padding: 20,
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
        padding: 15,
        borderRadius: 12,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    menuIcon: {
        width: 45,
        height: 45,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    menuIconText: {
        fontSize: 20,
    },
    menuText: {
        flex: 1,
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    menuArrow: {
        fontSize: 20,
        color: '#666',
    },
});