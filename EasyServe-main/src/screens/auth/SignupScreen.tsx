// ============================================
// screens/auth/SignupScreen.tsx - FIXED
// ============================================

import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  TouchableWithoutFeedback,
    Keyboard,

} from 'react-native';
import { authService } from '../../services/authService';
import { categoryService } from '../../services/categoryService';
import { validators } from '../../utils/validators';
import { logger } from '../../utils/logger';
import { Category } from '../../types';

const TAG = 'SignupScreen';

export default function SignupScreen({ navigation }: any) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<'user' | 'provider'>('user');

  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [price, setPrice] = useState('');
  const [area, setArea] = useState('');
  const [description, setDescription] = useState('');

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await categoryService.getAll();
      setCategories(data);
    } catch (error) {
      logger.error(TAG, 'Failed to load categories', error);
    }
  };

  const handleSignup = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }

    if (!validators.name(name)) {
      Alert.alert('Error', 'Name must be at least 2 characters');
      return;
    }

    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email');
      return;
    }

    if (!validators.email(email)) {
      Alert.alert('Error', 'Please enter a valid email');
      return;
    }

    if (!password) {
      Alert.alert('Error', 'Please enter a password');
      return;
    }

    const pwdValidation = validators.password(password);
    if (!pwdValidation.valid) {
      Alert.alert('Error', pwdValidation.error);
      return;
    }

    if (!phone.trim()) {
      Alert.alert('Error', 'Please enter your phone number');
      return;
    }

    if (!validators.phone(phone)) {
      Alert.alert('Error', 'Please enter a valid phone number');
      return;
    }

    if (role === 'provider') {
      if (!selectedCategory) {
        Alert.alert('Error', 'Please select a service category');
        return;
      }

      const priceValidation = validators.price(price);
      if (!priceValidation.valid) {
        Alert.alert('Error', priceValidation.error);
        return;
      }

      if (!area.trim()) {
        Alert.alert('Error', 'Please enter your service area');
        return;
      }

      if (!description.trim()) {
        Alert.alert('Error', 'Please enter a service description');
        return;
      }

      if (description.length > 1000) {
        Alert.alert('Error', 'Description is too long (max 1000 characters)');
        return;
      }
    }

    setLoading(true);

    try {
      logger.info(TAG, `Signup attempt as ${role}`);

      if (role === 'provider') {
        await authService.providerSignup({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
          phone: phone.trim(),
          categoryId: selectedCategory!._id || selectedCategory!.id || '',
          categoryName: selectedCategory!.name,
          price: parseFloat(price),
          area: area.trim(),
          description: description.trim(),
        });
        logger.info(TAG, 'Provider signup successful');
        Alert.alert('Success', 'Provider account created successfully!');
        navigation.replace('ProviderHome');
      } else {
        await authService.signup({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
          phone: phone.trim(),
        });
        logger.info(TAG, 'User signup successful');
        Alert.alert('Success', 'User account created successfully!');
        navigation.replace('Home');
      }
    } catch (error: any) {
      logger.error(TAG, 'Signup failed', error);
      const msg = error.response?.data?.message || 'Signup failed. Please try again.';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Sign up to get started</Text>

        <View style={styles.roleContainer}>
          <TouchableOpacity
            style={[styles.roleButton, role === 'user' && styles.roleButtonSelected]}
            onPress={() => setRole('user')}
          >
            <Text style={styles.roleIcon}>👤</Text>
            <Text style={[styles.roleText, role === 'user' && styles.roleTextSelected]}>
              User
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.roleButton, role === 'provider' && styles.roleButtonSelected]}
            onPress={() => setRole('provider')}
          >
            <Text style={styles.roleIcon}>🔧</Text>
            <Text style={[styles.roleText, role === 'provider' && styles.roleTextSelected]}>
              Provider
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionLabel}>Basic Information</Text>

        <TextInput
          style={styles.input}
          placeholder="Full Name"
          value={name}
          onChangeText={setName}
          placeholderTextColor="#999"
          editable={!loading}
        />

        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholderTextColor="#999"
          editable={!loading}
        />

        <TextInput
          style={styles.input}
          placeholder="Password (minimum 6 characters)"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholderTextColor="#999"
          editable={!loading}
        />

        <TextInput
          style={styles.input}
          placeholder="Phone Number"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          placeholderTextColor="#999"
          editable={!loading}
        />

        {role === 'provider' && (
          <>
            <Text style={styles.sectionLabel}>Service Information</Text>

            <TouchableOpacity
              style={styles.dropdown}
              onPress={() => setShowCategoryDropdown(!showCategoryDropdown)}
              disabled={loading}
            >
              <Text style={styles.dropdownText}>
                {selectedCategory?.name || 'Select Service Category'}
              </Text>
              <Text style={styles.dropdownIcon}>▼</Text>
            </TouchableOpacity>

            {showCategoryDropdown && (
              <View style={styles.dropdownList}>
                {categories.map((cat) => (
                  <TouchableOpacity
                    key={cat._id || cat.id}
                    style={styles.dropdownItem}
                    onPress={() => {
                      setSelectedCategory(cat);
                      setShowCategoryDropdown(false);
                    }}
                  >
                    <Text style={styles.dropdownItemText}>{cat.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <TextInput
              style={styles.input}
              placeholder="Base Price (Rs.)"
              value={price}
              onChangeText={setPrice}
              keyboardType="numeric"
              placeholderTextColor="#999"
              editable={!loading}
            />

            <TextInput
              style={styles.input}
              placeholder="Service Area (e.g., Karachi)"
              value={area}
              onChangeText={setArea}
              placeholderTextColor="#999"
              editable={!loading}
            />

            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Brief Description of your services"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              placeholderTextColor="#999"
              editable={!loading}
            />
          </>
        )}

        <TouchableOpacity
          style={[styles.signupButton, loading && styles.signupButtonDisabled]}
          onPress={handleSignup}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Text style={styles.signupButtonText}>Sign Up</Text>
              <Text style={styles.signupButtonIcon}>→</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Login')} disabled={loading}>
          <Text style={styles.loginLink}>
            Already have an account?{' '}
            <Text style={styles.loginLinkBold}>Login</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scrollContent: { padding: 20, paddingTop: 50, paddingBottom: 30 },
  title: { fontSize: 28, fontWeight: '800', color: '#333', marginBottom: 8 },
  subtitle: { fontSize: 15, color: '#666', marginBottom: 30 },
  roleContainer: { flexDirection: 'row', gap: 15, marginBottom: 30 },
  roleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 15,
    backgroundColor: '#F8F9FA',
  },
  roleButtonSelected: { borderColor: '#4CAF50', backgroundColor: '#F0FDF4' },
  roleIcon: { fontSize: 24, marginRight: 8 },
  roleText: { fontSize: 14, fontWeight: '700', color: '#666' },
  roleTextSelected: { color: '#4CAF50' },
  sectionLabel: { fontSize: 14, fontWeight: '700', color: '#333', marginBottom: 15, marginTop: 10 },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    fontSize: 15,
    color: '#333',
    backgroundColor: '#F8F9FA',
  },
  textArea: { minHeight: 100, textAlignVertical: 'top' },
  dropdown: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  dropdownText: { fontSize: 15, color: '#333', fontWeight: '500' },
  dropdownIcon: { fontSize: 12, color: '#666', fontWeight: '700' },
  dropdownList: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    marginBottom: 15,
    backgroundColor: '#fff',
    maxHeight: 200,
  },
  dropdownItem: { padding: 15, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  dropdownItemText: { fontSize: 15, color: '#333', fontWeight: '500' },
  signupButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 15,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  signupButtonDisabled: { opacity: 0.6 },
  signupButtonText: { color: '#fff', fontSize: 16, fontWeight: '800', marginRight: 8 },
  signupButtonIcon: { color: '#fff', fontSize: 18, fontWeight: '700' },
  loginLink: { textAlign: 'center', color: '#666', fontSize: 14 },
  loginLinkBold: { color: '#4CAF50', fontWeight: '700' },
});
