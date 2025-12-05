import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import FilterModal from '../../components/FilterModal';
import ProviderCard from '../../components/ProviderCard';
import { providerService } from '../../services/providerService';
import { Provider } from '../../types';

export default function ProviderListScreen({ route, navigation }: any) {
    // ✅ Safe extraction with fallbacks
    const categoryId = route.params?.categoryId;
    const categoryName = route.params?.categoryName || 'Service Providers';

    const [providers, setProviders] = useState<Provider[]>([]);
    const [filteredProviders, setFilteredProviders] = useState<Provider[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filterVisible, setFilterVisible] = useState(false);

    useEffect(() => {
        const loadProviders = async () => {
            // ✅ Early validation
            if (!categoryId) {
                console.error('❌ Category ID is missing!');
                console.log('Route params received:', route.params);
                setError('Category ID is missing. Please try again.');
                setLoading(false);
                return;
            }

            console.log('✅ Loading providers for categoryId:', categoryId);

            try {
                const data = await providerService.getByCategory(categoryId);
                
                console.log(`✅ Loaded ${data.length} providers`);
                
                // Debug: Check provider structure
                if (data.length > 0) {
                    console.log('First provider:', {
                        _id: data[0]._id,
                        id: data[0].id,
                        name: data[0].name
                    });
                }

                setProviders(data);
                setFilteredProviders(data);
                setError(null);
            } catch (err: any) {
                console.error('❌ Error loading providers:', err);
                setError(err.message || 'Failed to load providers');
            } finally {
                setLoading(false);
            }
        };

        loadProviders();
    }, [categoryId]);

    const handleFilter = (filters: { minPrice: number; maxPrice: number; area: string }) => {
        let filtered = providers;

        if (filters.area) {
            filtered = filtered.filter(p => p.area === filters.area);
        }

        filtered = filtered.filter(p => p.price >= filters.minPrice && p.price <= filters.maxPrice);

        setFilteredProviders(filtered);
    };

    const uniqueAreas = Array.from(new Set(providers.map(p => p.area)));

    // ✅ Error state
    if (error) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorIcon}>⚠️</Text>
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity 
                    style={styles.errorButton}
                    onPress={() => navigation.goBack()}
                >
                    <Text style={styles.errorButtonText}>← Go Back</Text>
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
                <Text style={styles.title}>{categoryName}</Text>
                <TouchableOpacity onPress={() => setFilterVisible(true)}>
                    <Text style={styles.filterButton}>🔍 Filter</Text>
                </TouchableOpacity>
            </View>

            {loading ? (
                <ActivityIndicator size="large" color="#4CAF50" style={styles.loader} />
            ) : filteredProviders.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyIcon}>🔍</Text>
                    <Text style={styles.emptyText}>No providers found</Text>
                    <Text style={styles.emptySubtext}>
                        Try adjusting your filters or check back later
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={filteredProviders}
                    keyExtractor={(item, index) => 
                        item._id?.toString() || item.id?.toString() || `prov-${index}`
                    }
                    renderItem={({ item }) => {
                        // ✅ Extract the correct ID (MongoDB uses _id)
                        const providerId = item._id?.toString() || item.id?.toString();

                        console.log('Rendering Provider:', {
                            name: item.name,
                            providerId: providerId
                        });

                        return (
                            <ProviderCard
                                provider={item}
                                onPress={() => {
                                    if (!providerId) {
                                        console.error('❌ Provider missing ID:', item);
                                        alert('This provider cannot be opened (missing ID)');
                                        return;
                                    }
                                    
                                    console.log('🚀 Navigating to ProviderDetails with:', providerId);
                                    navigation.navigate('ProviderDetails', { providerId });
                                }}
                            />
                        );
                    }}
                    contentContainerStyle={styles.list}
                />
            )}

            <FilterModal
                visible={filterVisible}
                onClose={() => setFilterVisible(false)}
                onApply={handleFilter}
                areas={uniqueAreas}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        paddingTop: 50,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    backButton: {
        fontSize: 16,
        color: '#4CAF50',
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: '#333',
    },
    filterButton: {
        fontSize: 16,
        color: '#2196F3',
    },
    loader: {
        marginTop: 50,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
        backgroundColor: '#f5f5f5',
    },
    errorIcon: {
        fontSize: 60,
        marginBottom: 20,
    },
    errorText: {
        fontSize: 18,
        color: '#d32f2f',
        textAlign: 'center',
        marginBottom: 30,
    },
    errorButton: {
        backgroundColor: '#4CAF50',
        paddingHorizontal: 30,
        paddingVertical: 12,
        borderRadius: 10,
    },
    errorButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    emptyIcon: {
        fontSize: 60,
        marginBottom: 20,
    },
    emptyText: {
        fontSize: 18,
        color: '#666',
        marginBottom: 8,
    },
    emptySubtext: {
        fontSize: 14,
        color: '#999',
        textAlign: 'center',
    },
    list: {
        padding: 20,
    },
});