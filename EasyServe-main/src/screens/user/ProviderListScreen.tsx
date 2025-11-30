import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import FilterModal from '../../components/FilterModal';
import ProviderCard from '../../components/ProviderCard';
import { providerService } from '../../services/providerService';
import { Provider } from '../../types/provider';

export default function ProviderListScreen({ route, navigation }: any) {
    const { categoryId, categoryName } = route.params;
    const [providers, setProviders] = useState<Provider[]>([]);
    const [filteredProviders, setFilteredProviders] = useState<Provider[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterVisible, setFilterVisible] = useState(false);

    useEffect(() => {
        loadProviders();
    }, []);

    const loadProviders = async () => {
        try {
            const data = await providerService.getByCategory(categoryId);
            setProviders(data);
            setFilteredProviders(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleFilter = (filters: { minPrice: number; maxPrice: number; area: string }) => {
        let filtered = providers;

        if (filters.area) {
            filtered = filtered.filter(p => p.area === filters.area);
        }

        filtered = filtered.filter(p => p.price >= filters.minPrice && p.price <= filters.maxPrice);

        setFilteredProviders(filtered);
    };

    const uniqueAreas = Array.from(new Set(providers.map(p => p.area)));

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
                    <Text style={styles.emptyText}>No providers found</Text>
                </View>
            ) : (
                <FlatList
                    data={filteredProviders}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <ProviderCard
                            provider={item}
                            onPress={() => navigation.navigate('ProviderDetails', { providerId: item.id })}
                        />
                    )}
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
        paddingTop: 50,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 20,
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
        fontSize: 14,
        color: '#4CAF50',
    },
    loader: {
        marginTop: 50,
    },
    list: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 16,
        color: '#666',
    },
});