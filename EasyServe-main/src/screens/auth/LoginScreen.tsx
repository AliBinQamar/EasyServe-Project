// ============================================
// screens/auth/LoginScreen.tsx - FIXED
// ============================================

import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { authService } from '../../services/authService';
import { validators } from '../../utils/validators';
import { logger } from '../../utils/logger';

const TAG = 'LoginScreen';
const { width, height } = Dimensions.get('window');

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'user' | 'provider'>('user');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email');
      return;
    }

    if (!validators.email(email)) {
      Alert.alert('Error', 'Please enter a valid email');
      return;
    }

    if (!password) {
      Alert.alert('Error', 'Please enter your password');
      return;
    }

    setLoading(true);
    try {
      logger.info(TAG, `Login attempt as ${role}`);

      const result =
        role === 'provider'
          ? await authService.providerLogin(email.toLowerCase(), password)
          : await authService.login(email.toLowerCase(), password);

      if (result.user.role !== role) {
        Alert.alert(
          'Error',
          `This account is registered as a ${result.user.role}, not a ${role}`
        );
        setLoading(false);
        return;
      }

      logger.info(TAG, 'Login successful');

      if (result.user.role === 'provider') {
        navigation.replace('ProviderHome');
      } else {
        navigation.replace('Home');
      }
    } catch (error: any) {
      logger.error(TAG, 'Login failed', error);
      const msg = error.response?.data?.message || 'Invalid email or password';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.topSection}>
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoIcon}>🛠️</Text>
          </View>
          <Text style={styles.appName}>EasyServe</Text>
          <Text style={styles.tagline}>Your Service Marketplace</Text>
        </View>
      </View>

      <View style={styles.formSection}>
        <Text style={styles.welcomeText}>Welcome Back!</Text>
        <Text style={styles.subtitle}>Sign in to continue</Text>

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

        <View style={styles.inputContainer}>
          <Text style={styles.inputIcon}>📧</Text>
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
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputIcon}>🔒</Text>
          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholderTextColor="#999"
            editable={!loading}
          />
        </View>

        <TouchableOpacity
          style={[styles.loginButton, loading && styles.loginButtonDisabled]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Text style={styles.loginButtonText}>Sign In</Text>
              <Text style={styles.loginButtonIcon}>→</Text>
            </>
          )}
        </TouchableOpacity>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>OR</Text>
          <View style={styles.dividerLine} />
        </View>

        <TouchableOpacity
          style={styles.signupButton}
          onPress={() => navigation.navigate('Signup')}
          disabled={loading}
        >
          <Text style={styles.signupButtonText}>Create New Account</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  topSection: {
    height: height * 0.35,
    backgroundColor: '#4CAF50',
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
  },
  logoContainer: { alignItems: 'center' },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  logoIcon: { fontSize: 50 },
  appName: { fontSize: 36, fontWeight: '800', color: '#fff', marginBottom: 8, letterSpacing: 1 },
  tagline: { fontSize: 15, color: 'rgba(255,255,255,0.9)', fontWeight: '500' },
  formSection: { flex: 1, padding: 30, justifyContent: 'center' },
  welcomeText: { fontSize: 28, fontWeight: '800', color: '#333', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#666', marginBottom: 20 },
  roleContainer: { flexDirection: 'row', gap: 12, marginBottom: 25 },
  roleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingVertical: 12,
    backgroundColor: '#F8F9FA',
  },
  roleButtonSelected: { borderColor: '#4CAF50', backgroundColor: '#F0FDF4' },
  roleIcon: { fontSize: 20, marginRight: 6 },
  roleText: { fontSize: 13, fontWeight: '700', color: '#666' },
  roleTextSelected: { color: '#4CAF50' },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    paddingHorizontal: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  inputIcon: { fontSize: 20, marginRight: 10 },
  input: { flex: 1, padding: 16, fontSize: 16, color: '#333' },
  loginButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 16,
    padding: 18,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  loginButtonDisabled: { opacity: 0.6 },
  loginButtonText: { color: '#fff', fontSize: 18, fontWeight: '800', marginRight: 8 },
  loginButtonIcon: { color: '#fff', fontSize: 20, fontWeight: '700' },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 25 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#E0E0E0' },
  dividerText: { marginHorizontal: 15, color: '#999', fontSize: 14, fontWeight: '600' },
  signupButton: {
    borderWidth: 2,
    borderColor: '#4CAF50',
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
  },
  signupButtonText: { color: '#4CAF50', fontSize: 16, fontWeight: '700' },
});