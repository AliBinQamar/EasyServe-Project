import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Provider } from '../types'; // ← UPDATED IMPORT

interface Props {
    provider: Provider;
    onPress: () => void;
}

export default function ProviderCard({ provider, onPress }: Props) {
    return (
        <TouchableOpacity style={styles.card} onPress={onPress}>
            <View style={styles.imageContainer}>
                <Text style={styles.imagePlaceholder}>👤</Text>
            </View>
            <View style={styles.info}>
                <Text style={styles.name}>{provider.name}</Text>
                <Text style={styles.area}>📍 {provider.area}</Text>
                <View style={styles.footer}>
                    <Text style={styles.price}>Rs. {provider.price}</Text>
                    <View style={styles.rating}>
                        <Text style={styles.star}>⭐</Text>
                        <Text style={styles.ratingText}>{provider.rating}</Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 15,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    imageContainer: {
        width: 70,
        height: 70,
        borderRadius: 12,
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    imagePlaceholder: {
        fontSize: 35,
    },
    info: {
        flex: 1,
        justifyContent: 'space-between',
    },
    name: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    area: {
        fontSize: 13,
        color: '#666',
        marginBottom: 8,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    price: {
        fontSize: 16,
        fontWeight: '700',
        color: '#4CAF50',
    },
    rating: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    star: {
        fontSize: 14,
        marginRight: 4,
    },
    ratingText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
    },
});