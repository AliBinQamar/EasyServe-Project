import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { categoryService } from '../../services/categoryService';
import { Category } from '../../types/category';

export default function ManageCategoriesScreen({ navigation }: any) {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [name, setName] = useState('');
    const [icon, setIcon] = useState('');

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

    const handleSave = async () => {
        if (!name) {
            Alert.alert('Error', 'Please enter category name');
            return;
        }

        try {
            if (editingCategory) {
                await categoryService.update(editingCategory.id, { name, icon });
                Alert.alert('Success', 'Category updated successfully');
            } else {
                await categoryService.create({ name, icon });
                Alert.alert('Success', 'Category added successfully');
            }
            resetForm();
            loadCategories();
        } catch (error: any) {
            Alert.alert('Error', error.message);
        }
    };

    const handleEdit = (category: Category) => {
        setEditingCategory(category);
        setName(category.name);
        setIcon(category.icon || '');
        setModalVisible(true);
    };

    const handleDelete = (category: Category) => {
        Alert.alert(
            'Delete Category',
            `Are you sure you want to delete "${category.name}"?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await categoryService.delete(category.id);
                            Alert.alert('Success', 'Category deleted');
                            loadCategories();
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
        setIcon('');
        setEditingCategory(null);
        setModalVisible(false);
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={styles.backButton}>← Back</Text>
                </TouchableOpacity>
                <Text style={styles.title}>Manage Categories</Text>
                <TouchableOpacity onPress={() => setModalVisible(true)}>
                    <Text style={styles.addButton}>+ Add</Text>
                </TouchableOpacity>
            </View>

            {loading ? (
                <ActivityIndicator size="large" color="#2196F3" style={styles.loader} />
            ) : (
                <FlatList
                    data={categories}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <View style={styles.categoryCard}>
                            <View style={styles.categoryInfo}>
                                <Text style={styles.categoryIcon}>{item.icon || '📂'}</Text>
                                <Text style={styles.categoryName}>{item.name}</Text>
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
                        <Text style={styles.modalTitle}>
                            {editingCategory ? 'Edit Category' : 'Add Category'}
                        </Text>

                        <TextInput
                            style={styles.input}
                            placeholder="Category Name"
                            value={name}
                            onChangeText={setName}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Icon (emoji)"
                            value={icon}
                            onChangeText={setIcon}
                        />

                        <View style={styles.modalButtons}>
                            <TouchableOpacity style={styles.cancelButton} onPress={resetForm}>
                                <Text style={styles.cancelText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                                <Text style={styles.saveText}>Save</Text>
                            </TouchableOpacity>
                        </View>
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
    categoryCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
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
    categoryInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    categoryIcon: {
        fontSize: 30,
        marginRight: 15,
    },
    categoryName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    actions: {
        flexDirection: 'row',
        gap: 10,
    },
    editButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
        backgroundColor: '#E3F2FD',
    },
    editText: {
        color: '#2196F3',
        fontSize: 14,
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
        fontSize: 14,
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
        width: '85%',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 20,
        textAlign: 'center',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 10,
        padding: 15,
        marginBottom: 15,
        fontSize: 16,
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