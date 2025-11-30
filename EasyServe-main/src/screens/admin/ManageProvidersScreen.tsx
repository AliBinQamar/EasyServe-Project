import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { categoryService } from '../../services/categoryService';
import { providerService } from '../../services/providerService';
import { Category } from '../../types/category';
import { Provider } from '../../types/provider';

export default function ManageProvidersScreen({ navigation }: any) {
    const [providers, setProviders] = useState<Provider[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingProvider, setEditingProvider] = useState<Provider | null>(null);

    const [name, setName] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [price, setPrice] = useState('');
    const [area, setArea] = useState('');
    const [rating, setRating] = useState('');
    const [description, setDescription] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [providersData, categoriesData] = await Promise.all([
                providerService.getAll(),
                categoryService.getAll(),
            ]);
            setProviders(providersData);
            setCategories(categoriesData);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!name || !categoryId || !price || !area) {
            Alert.alert('Error', 'Please fill required fields');
            return;
        }

        try {
            const selectedCategory = categories.find(c => c.id === categoryId);
            const providerData = {
                name,
                categoryId,
                categoryName: selectedCategory?.name,
                price: parseFloat(price),
                area,
                rating: parseFloat(rating) || 0,
                description,
            };

            if (editingProvider) {
                await providerService.update(editingProvider.id, providerData);
                Alert.alert('Success', 'Provider updated successfully');
            } else {
                await providerService.create(providerData);
                Alert.alert('Success', 'Provider added successfully');
            }
            resetForm();
            loadData();
        } catch (error: any) {
            Alert.alert('Error', error.message);
        }
    };

    const handleEdit = (provider: Provider) => {
        setEditingProvider(provider);
        setName(provider.name);
        setCategoryId(provider.categoryId);
        setPrice(provider.price.toString());
        setArea(provider.area);
        setRating(provider.rating.toString());
        setDescription(provider.description);
        setModalVisible(true);
    };

    const handleDelete = (provider: Provider) => {
        Alert.alert(
            'Delete Provider',
            `Are you sure you want to delete "${provider.name}"?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await providerService.delete(provider.id);
                            Alert.alert('Success', 'Provider deleted');
                            loadData();
                        } catch (error: any) {
                            Alert.alert('Error', error.message);
                        }
                    },
                },
            ]
        );
    };

    const resetForm = () => {
        setName('');
        setCategoryId('');
        setPrice('');
        setArea('');
        setRating('');
        setDescription('');
        setEditingProvider(null);
        setModalVisible(false);
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={styles.backButton}>← Back</Text>
                </TouchableOpacity>
                <Text style={styles.title}>Manage Providers</Text>
                <TouchableOpacity onPress={() => setModalVisible(true)}>
                    <Text style={styles.addButton}>+ Add</Text>
                </TouchableOpacity>
            </View>

            {loading ? (
                <ActivityIndicator size="large" color="#2196F3" style={styles.loader} />
            ) : (
                <FlatList
                    data={providers}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <View style={styles.providerCard}>
                            <View style={styles.providerInfo}>
                                <Text style={styles.providerName}>{item.name}</Text>
                                <Text style={styles.providerDetails}>
                                    {item.categoryName} • Rs. {item.price} • {item.area}
                                </Text>
                                <Text style={styles.providerRating}>⭐ {item.rating}</Text>
                            </View>
                            <View style={styles.actions}>
                                <TouchableOpacity onPress={() => handleEdit(item)} style={styles.editButton}>
                                    <Text style={styles.editText}>Edit</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => handleDelete(item)} style={styles.deleteButton}>
                                    <Text style={styles.deleteText}>Delete</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                    contentContainerStyle={styles.list}
                />
            )}

            <Modal visible={modalVisible} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <ScrollView>
                            <Text style={styles.modalTitle}>
                                {editingProvider ? 'Edit Provider' : 'Add Provider'}
                            </Text>

                            <TextInput
                                style={styles.input}
                                placeholder="Provider Name *"
                                value={name}
                                onChangeText={setName}
                            />

                            <Text style={styles.label}>Select Category *</Text>
                            <View style={styles.categoryPicker}>
                                {categories.map((cat) => (
                                    <TouchableOpacity
                                        key={cat.id}
                                        style={[
                                            styles.categoryOption,
                                            categoryId === cat.id && styles.categoryOptionSelected,
                                        ]}
                                        onPress={() => setCategoryId(cat.id)}
                                    >
                                        <Text style={[
                                            styles.categoryOptionText,
                                            categoryId === cat.id && styles.categoryOptionTextSelected,
                                        ]}>
                                            {cat.name}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <TextInput
                                style={styles.input}
                                placeholder="Price *"
                                value={price}
                                onChangeText={setPrice}
                                keyboardType="numeric"
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="Area *"
                                value={area}
                                onChangeText={setArea}
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="Rating (0-5)"
                                value={rating}
                                onChangeText={setRating}
                                keyboardType="decimal-pad"
                            />
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                placeholder="Description"
                                value={description}
                                onChangeText={setDescription}
                                multiline
                                numberOfLines={4}
                            />

                            <View style={styles.modalButtons}>
                                <TouchableOpacity style={styles.cancelButton} onPress={resetForm}>
                                    <Text style={styles.cancelText}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                                    <Text style={styles.saveText}>Save</Text>
                                </TouchableOpacity>
                            </View>
                        </ScrollView>
                    </View>
                </View>
            </Modal>
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
        color: '#2196F3',
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: '#333',
    },
    addButton: {
        fontSize: 16,
        color: '#4CAF50',
        fontWeight: '600',
    },
    loader: {
        marginTop: 50,
    },
    list: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    providerCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
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
    providerInfo: {
        flex: 1,
    },
    providerName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    providerDetails: {
        fontSize: 13,
        color: '#666',
        marginBottom: 4,
    },
    providerRating: {
        fontSize: 13,
        color: '#666',
    },
    actions: {
        justifyContent: 'center',
        gap: 8,
    },
    editButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
        backgroundColor: '#E3F2FD',
    },
    editText: {
        color: '#2196F3',
        fontSize: 13,
        fontWeight: '600',
    },
    deleteButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
        backgroundColor: '#FFEBEE',
    },
    deleteText: {
        color: '#f44336',
        fontSize: 13,
        fontWeight: '600',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 20,
        width: '90%',
        maxHeight: '80%',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 20,
        textAlign: 'center',
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 10,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 10,
        padding: 15,
        marginBottom: 15,
        fontSize: 16,
    },
    textArea: {
        textAlignVertical: 'top',
        minHeight: 100,
    },
    categoryPicker: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        marginBottom: 15,
    },
    categoryOption: {
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#ddd',
        backgroundColor: '#f9f9f9',
    },
    categoryOptionSelected: {
        backgroundColor: '#2196F3',
        borderColor: '#2196F3',
    },
    categoryOptionText: {
        fontSize: 14,
        color: '#666',
    },
    categoryOptionTextSelected: {
        color: '#fff',
        fontWeight: '600',
    },
    modalButtons: {
        flexDirection: 'row',
        gap: 10,
        marginTop: 10,
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
    saveButton: {
        flex: 1,
        padding: 15,
        borderRadius: 10,
        backgroundColor: '#4CAF50',
        alignItems: 'center',
    },
    saveText: {
        fontSize: 16,
        color: '#fff',
        fontWeight: '600',
    },
});