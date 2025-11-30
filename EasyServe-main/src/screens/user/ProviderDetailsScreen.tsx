import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { providerService } from '../../services/providerService';
import { Provider } from '../../types/provider';

export default function ProviderDetailsScreen({ route, navigation }: any) {
    const { providerId } = route.params;
    const [provider, setProvider] = useState<Provider | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadProvider();
    }, []);

    const loadProvider = async () => {
        try {
            const data = await providerService.getById(providerId);
            setProvider(data);
        } catch (error) {
            console.error(error);
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

    if (!provider) {
        return (
            <View style={styles.loaderContainer}>
                <Text>Provider not found</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                <Text style={styles.backText}>← Back</Text>
            </TouchableOpacity>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.imageContainer}>
                    <Text style={styles.imagePlaceholder}>👤</Text>
                </View>

                <Text style={styles.name}>{provider.name}</Text>
                <Text style={styles.category}>{provider.categoryName || 'Service Provider'}</Text>

                <View style={styles.infoRow}>
                    <View style={styles.infoCard}>
                        <Text style={styles.infoLabel}>Price</Text>
                        <Text style={styles.infoValue}>Rs. {provider.price}</Text>
                    </View>
                    <View style={styles.infoCard}>
                        <Text style={styles.infoLabel}>Rating</Text>
                        <Text style={styles.infoValue}>⭐ {provider.rating}</Text>
                    </View>
                    <View style={styles.infoCard}>
                        <Text style={styles.infoLabel}>Area</Text>
                        <Text style={styles.infoValue}>{provider.area}</Text>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Description</Text>
                    <Text style={styles.description}>{provider.description}</Text>
                </View>

                {provider.reviews && provider.reviews.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Reviews</Text>
                        {provider.reviews.map((review, index) => (
                            <View key={index} style={styles.review}>
                                <View style={styles.reviewHeader}>
                                    <Text style={styles.reviewName}>{review.userName}</Text>
                                    <Text style={styles.reviewRating}>⭐ {review.rating}</Text>
                                </View>
                                <Text style={styles.reviewComment}>{review.comment}</Text>
                            </View>
                        ))}
                    </View>
                )}
            </ScrollView>

            <TouchableOpacity
                style={styles.bookButton}
                onPress={() => navigation.navigate('Booking', { provider })}
            >
                <Text style={styles.bookButtonText}>Book Now</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    backButton: {
        paddingHorizontal: 20,
        paddingTop: 50,
        paddingBottom: 10,
    },
    backText: {
        fontSize: 16,
        color: '#4CAF50',
    },
    content: {
        padding: 20,
    },
    imageContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
        marginBottom: 20,
    },
    imagePlaceholder: {
        fontSize: 60,
    },
    name: {
        fontSize: 24,
        fontWeight: '700',
        textAlign: 'center',
        color: '#333',
        marginBottom: 5,
    },
    category: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        marginBottom: 20,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    infoCard: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginHorizontal: 5,
    },
    infoLabel: {
        fontSize: 12,
        color: '#666',
        marginBottom: 5,
    },
    infoValue: {
        fontSize: 16,
        fontWeight: '700',
        color: '#333',
    },
    section: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 10,
        color: '#333',
    },
    description: {
        fontSize: 14,
        color: '#666',
        lineHeight: 22,
    },
    review: {
        backgroundColor: '#f5f5f5',
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
    },
    reviewHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 5,
    },
    reviewName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
    },
    reviewRating: {
        fontSize: 14,
        color: '#666',
    },
    reviewComment: {
        fontSize: 13,
        color: '#666',
    },
    bookButton: {
        backgroundColor: '#4CAF50',
        padding: 18,
        margin: 20,
        borderRadius: 10,
        alignItems: 'center',
    },
    bookButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '700',
    },
});