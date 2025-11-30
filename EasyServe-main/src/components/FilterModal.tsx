import React, { useState } from 'react';
import { Modal, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

// Conditional import for Slider
let Slider: any = null;
if (Platform.OS !== 'web') {
    Slider = require('@react-native-community/slider').default;
}

interface Props {
    visible: boolean;
    onClose: () => void;
    onApply: (filters: { minPrice: number; maxPrice: number; area: string }) => void;
    areas: string[];
}

export default function FilterModal({ visible, onClose, onApply, areas }: Props) {
    const [minPrice, setMinPrice] = useState(0);
    const [maxPrice, setMaxPrice] = useState(10000);
    const [selectedArea, setSelectedArea] = useState('');

    const handleApply = () => {
        onApply({ minPrice, maxPrice, area: selectedArea });
        onClose();
    };

    return (
        <Modal visible={visible} transparent animationType="slide">
            <View style={styles.overlay}>
                <View style={styles.container}>
                    <Text style={styles.title}>Filter Providers</Text>

                    <Text style={styles.label}>Price Range</Text>
                    <View style={styles.priceRange}>
                        <Text>Rs. {minPrice}</Text>
                        <Text>Rs. {maxPrice}</Text>
                    </View>

                    {Platform.OS === 'web' ? (
                        <View style={styles.webSliderContainer}>
                            <TextInput
                                style={styles.webSlider}
                                placeholder="Max Price (0-10000)"
                                value={maxPrice.toString()}
                                onChangeText={(text) => {
                                    const value = parseInt(text) || 0;
                                    setMaxPrice(Math.min(10000, Math.max(0, value)));
                                }}
                                keyboardType="numeric"
                            />
                        </View>
                    ) : Slider ? (
                        <Slider
                            style={styles.slider}
                            minimumValue={0}
                            maximumValue={10000}
                            value={maxPrice}
                            onValueChange={setMaxPrice}
                            minimumTrackTintColor="#4CAF50"
                            maximumTrackTintColor="#ddd"
                        />
                    ) : null}

                    <Text style={styles.label}>Area</Text>
                    <View style={styles.areaContainer}>
                        {areas.map((area) => (
                            <TouchableOpacity
                                key={area}
                                style={[styles.areaButton, selectedArea === area && styles.areaButtonSelected]}
                                onPress={() => setSelectedArea(area)}
                            >
                                <Text style={[styles.areaText, selectedArea === area && styles.areaTextSelected]}>
                                    {area}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <View style={styles.buttons}>
                        <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                            <Text style={styles.cancelText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
                            <Text style={styles.applyText}>Apply</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    container: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        maxHeight: '80%',
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 20,
        textAlign: 'center',
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        marginTop: 15,
        marginBottom: 10,
    },
    priceRange: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    webSliderContainer: {
        marginVertical: 10,
    },
    webSlider: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 10,
        padding: 15,
        fontSize: 16,
        backgroundColor: '#f9f9f9',
    },
    slider: {
        width: '100%',
        height: 40,
    },
    areaContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    areaButton: {
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    areaButtonSelected: {
        backgroundColor: '#4CAF50',
        borderColor: '#4CAF50',
    },
    areaText: {
        color: '#666',
    },
    areaTextSelected: {
        color: '#fff',
        fontWeight: '600',
    },
    buttons: {
        flexDirection: 'row',
        marginTop: 30,
        gap: 10,
    },
    cancelButton: {
        flex: 1,
        padding: 15,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#ddd',
        alignItems: 'center',
    },
    cancelText: {
        fontSize: 16,
        color: '#666',
    },
    applyButton: {
        flex: 1,
        padding: 15,
        borderRadius: 10,
        backgroundColor: '#4CAF50',
        alignItems: 'center',
    },
    applyText: {
        fontSize: 16,
        color: '#fff',
        fontWeight: '600',
    },
});