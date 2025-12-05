// ============================================
// FILE 1: HomeScreen.tsx (FIXED)
// ============================================

import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import CategoryCard from '../../components/CategoryCard';
import { authService } from '../../services/authService';
import { categoryService } from '../../services/categoryService';
import { Category } from '../../types/index';

export default function HomeScreen({ navigation }: any) {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        try {
            const data = await categoryService.getAll();
            console.log('✅ Loaded categories:', data.length);
            
            // Debug: Check first category structure
            if (data.length > 0) {
                console.log('First category:', {
                    _id: data[0]._id,
                    id: data[0].id,
                    name: data[0].name
                });
            }
            
            setCategories(data);
        } catch (error) {
            console.error('Error loading categories:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await authService.logout();
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
                    keyExtractor={(item, index) => 
                        item._id?.toString() || item.id?.toString() || `cat-${index}`
                    }
                    numColumns={2}
                    renderItem={({ item }) => {
                        // ✅ Extract the correct ID (MongoDB uses _id)
                        const categoryId = item._id?.toString() || item.id?.toString();
                        const categoryName = item.name || 'Unknown Category';

                        // ✅ Debug log
                        console.log('Rendering category:', {
                            name: categoryName,
                            _id: item._id,
                            id: item.id,
                            categoryId: categoryId
                        });

                        return (
                            <CategoryCard
                                category={item}
                                onPress={() => {
                                    // ✅ Safety check before navigation
                                    if (!categoryId) {
                                        console.error('❌ Category missing ID:', item);
                                        alert('This category cannot be opened (missing ID)');
                                        return;
                                    }

                                    console.log('🚀 Navigating to ProviderList with:', {
                                        categoryId,
                                        categoryName
                                    });

                                    navigation.navigate('ProviderList', {
                                        categoryId: categoryId,
                                        categoryName: categoryName
                                    });
                                }}
                            />
                        );
                    }}
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