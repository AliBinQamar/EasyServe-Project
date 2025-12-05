import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  StyleSheet,
} from 'react-native';
import { categoryService } from '../../services/categoryService';
import { providerService } from '../../services/providerService';
import { Category, Provider } from '../../types';

export default function ManageProvidersScreen({ navigation }: any) {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingProvider, setEditingProvider] = useState<Provider | null>(null);

  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState<string>('');
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
    } catch (error: any) {
      console.error(error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!name || !categoryId || !price || !area) {
      Alert.alert('Error', 'Please fill required fields');
      return;
    }

    const selectedCategory = categories.find(c => (c.id || c._id) === categoryId);

    if (!selectedCategory) {
      Alert.alert('Error', 'Selected category not found');
      return;
    }

    const providerData = {
      name,
      categoryId,
      categoryName: selectedCategory.name,
      price: parseFloat(price),
      area,
      rating: parseFloat(rating) || 0,
      description,
    };

    try {
      if (editingProvider) {
        // Use id or _id safely
        const providerId = editingProvider.id || editingProvider._id || '';
        await providerService.update(providerId, providerData);
        Alert.alert('Success', 'Provider updated successfully');
      } else {
        await providerService.create(providerData);
        Alert.alert('Success', 'Provider added successfully');
      }
      resetForm();
      loadData();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to save provider');
    }
  };

  const handleEdit = (provider: Provider) => {
    setEditingProvider(provider);
    setName(provider.name);
    setCategoryId(provider.categoryId);
    setPrice(provider.price.toString());
    setArea(provider.area);
    setRating(provider.rating.toString());
    setDescription(provider.description || '');
    setModalVisible(true);
  };

  const handleDelete = (provider: Provider) => {
  const providerId = provider.id || provider._id || '';
  
  if (!providerId) {
    Alert.alert('Error', 'Provider ID not found');
    return;
  }

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
            console.log('Deleting provider with id:', providerId); // debug log
            await providerService.delete(providerId); // ensure providerService.delete calls DELETE /providers/:id
            Alert.alert('Success', 'Provider deleted successfully');
            loadData(); // reload list after deletion
          } catch (error: any) {
            console.error('Delete error:', error);
            Alert.alert('Error', error.response?.data?.message || 'Failed to delete provider');
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
          keyExtractor={item => String(item.id || item._id)}
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
              <Text style={styles.modalTitle}>{editingProvider ? 'Edit Provider' : 'Add Provider'}</Text>

              <TextInput
                style={styles.input}
                placeholder="Provider Name"
                value={name}
                onChangeText={setName}
              />

              <Text style={styles.label}>Select Category</Text>
              <View style={styles.categoryPicker}>
                {categories.map(cat => {
                  const cid = cat.id || cat._id || '';
                  return (
                    <TouchableOpacity
                      key={cid}
                      style={[
                        styles.categoryOption,
                        categoryId === cid && styles.categoryOptionSelected,
                      ]}
                      onPress={() => setCategoryId(cid)}
                    >
                      <Text
                        style={[
                          styles.categoryOptionText,
                          categoryId === cid && styles.categoryOptionTextSelected,
                        ]}
                      >
                        {cat.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <TextInput
                style={styles.input}
                placeholder="Price"
                value={price}
                onChangeText={setPrice}
                keyboardType="numeric"
              />
              <TextInput
                style={styles.input}
                placeholder="Area"
                value={area}
                onChangeText={setArea}
              />
              <TextInput
                style={styles.input}
                placeholder="Rating"
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
    container: { flex: 1, backgroundColor: '#f5f5f5', paddingTop: 50 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 20 },
    backButton: { fontSize: 16, color: '#2196F3' },
    title: { fontSize: 18, fontWeight: '700', color: '#333' },
    addButton: { fontSize: 16, color: '#4CAF50', fontWeight: '600' },
    loader: { marginTop: 50 },
    list: { paddingHorizontal: 20, paddingBottom: 20 },
    providerCard: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#fff', padding: 15, borderRadius: 12, marginBottom: 12, elevation: 2 },
    providerInfo: { flex: 1 },
    providerName: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
    providerDetails: { fontSize: 13, color: '#666', marginBottom: 4 },
    providerRating: { fontSize: 13, color: '#666' },
    actions: { justifyContent: 'center', gap: 8 },
    editButton: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6, backgroundColor: '#E3F2FD' },
    editText: { color: '#2196F3', fontSize: 13, fontWeight: '600' },
    deleteButton: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6, backgroundColor: '#FFEBEE' },
    deleteText: { color: '#f44336', fontSize: 13, fontWeight: '600' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
    modalContainer: { backgroundColor: '#fff', borderRadius: 20, padding: 20, width: '90%', maxHeight: '80%' },
    modalTitle: { fontSize: 20, fontWeight: '700', marginBottom: 20, textAlign: 'center' },
    label: { fontSize: 14, fontWeight: '600', marginBottom: 10 },
    input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 15, marginBottom: 15 },
    textArea: { textAlignVertical: 'top', minHeight: 100 },
    categoryPicker: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 15 },
    categoryOption: { paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#ddd', backgroundColor: '#f9f9f9' },
    categoryOptionSelected: { backgroundColor: '#2196F3', borderColor: '#2196F3' },
    categoryOptionText: { fontSize: 14, color: '#666' },
    categoryOptionTextSelected: { color: '#fff', fontWeight: '600' },
    modalButtons: { flexDirection: 'row', gap: 10, marginTop: 10 },
    cancelButton: { flex: 1, padding: 15, borderRadius: 10, borderWidth: 1, borderColor: '#ddd', alignItems: 'center' },
    saveButton: { flex: 1, padding: 15, borderRadius: 10, backgroundColor: '#4CAF50', alignItems: 'center' },
    saveText: { color: '#fff', fontSize: 16, fontWeight: '600' },
    cancelText: { color: '#666', fontSize: 16 },
});
