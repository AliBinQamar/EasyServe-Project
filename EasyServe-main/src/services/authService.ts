import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../config/api';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'user' | 'admin';
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export const authService = {
  // Signup
  async signup(data: { name: string; email: string; password: string; phone?: string }): Promise<AuthResponse> {
    const res = await api.post('/auth/signup', data);
    
    // Store token and user data
    await AsyncStorage.setItem('userToken', res.data.token);
    await AsyncStorage.setItem('userData', JSON.stringify(res.data.user));
    
    return res.data;
  },

  // Login
  async login(email: string, password: string): Promise<AuthResponse> {
    const res = await api.post('/auth/login', { email, password });
    
    // Store token and user data
    await AsyncStorage.setItem('userToken', res.data.token);
    await AsyncStorage.setItem('userData', JSON.stringify(res.data.user));
    
    return res.data;
  },

  // Logout
  async logout(): Promise<void> {
    await AsyncStorage.removeItem('userToken');
    await AsyncStorage.removeItem('userData');
  },

  // Get current user from storage
  async getCurrentUser(): Promise<User | null> {
    const userData = await AsyncStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
  },

  // Get token
  async getToken(): Promise<string | null> {
    return await AsyncStorage.getItem('userToken');
  },

  // Check if user is authenticated
  async isAuthenticated(): Promise<boolean> {
    const token = await AsyncStorage.getItem('userToken');
    return !!token;
  },
};