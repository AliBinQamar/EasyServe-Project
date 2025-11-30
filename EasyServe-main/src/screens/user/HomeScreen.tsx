import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import CategoryCard from '../../components/CategoryCard';
import { auth } from '../../config/firebase';
import { categoryService } from '../../services/categoryService';
import { profileCache } from '../../storage/asyncProfileCache';
import { Category } from '../../types/category';

export default function HomeScreen({ navigation }: any) {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        try {
            const data = await categoryService.getAll();
            setCategories(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await auth.signOut();
        await profileCache.clear();
        navigation.replace('Login');
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.greeting}>Hello! 👋</Text>
                    <Text style={styles.subtitle}>Find your service</Text>
                </View>
                <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
                    <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>
            </View>

            <TouchableOpacity
                style={styles.myBookingsButton}
                onPress={() => navigation.navigate('MyBookings')}
            >
                <Text style={styles.myBookingsText}>📋 My Bookings</Text>
            </TouchableOpacity>

            <Text style={styles.title}>Categories</Text>

            {loading ? (
                <ActivityIndicator size="large" color="#4CAF50" style={styles.loader} />
            ) : (
                <FlatList
                    data={categories}
                    keyExtractor={(item) => item.id}
                    numColumns={2}
                    renderItem={({ item }) => (
                        <CategoryCard
                            category={item}
                            onPress={() => navigation.navigate('ProviderList', {
                                categoryId: item.id,
                                categoryName: item.name
                            })}
                        />
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
    myBookingsButton: {
        marginHorizontal: 20,
        backgroundColor: '#2196F3',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginBottom: 20,
    },
    myBookingsText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        paddingHorizontal: 20,
        marginBottom: 15,
        color: '#333',
    },
    loader: {
        marginTop: 50,
    },
    list: {
        paddingHorizontal: 12,
        paddingBottom: 20,
    },
});