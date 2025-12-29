import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../config/api';
import { User, Provider, AuthUser } from '../types';
import { STORAGE_KEYS } from '../utils/constants';
import { logger } from '../utils/logger';

const TAG = 'AuthService';

export interface AuthResponse {
  message: string;
  token: string;
  user: AuthUser;
}

export const authService = {
  async signup(data: {
    name: string;
    email: string;
    password: string;
    phone?: string;
  }): Promise<AuthResponse> {
    try {
      const res = await api.post('/auth/signup', data);
      await AsyncStorage.setItem(STORAGE_KEYS.USER_TOKEN, res.data.token);
      await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(res.data.user));
      logger.info(TAG, 'User signup successful');
      return res.data;
    } catch (error) {
      logger.error(TAG, 'Signup failed', error);
      throw error;
    }
  },

  async providerSignup(data: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    categoryId: string;
    categoryName: string;
    price: number;
    area: string;
    description: string;
  }): Promise<AuthResponse> {
    try {
      const res = await api.post('/auth/provider/signup', data);
      await AsyncStorage.setItem(STORAGE_KEYS.USER_TOKEN, res.data.token);
      await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(res.data.user));
      logger.info(TAG, 'Provider signup successful');
      return res.data;
    } catch (error) {
      logger.error(TAG, 'Provider signup failed', error);
      throw error;
    }
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const res = await api.post('/auth/login', { email, password });
      await AsyncStorage.setItem(STORAGE_KEYS.USER_TOKEN, res.data.token);
      await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(res.data.user));
      logger.info(TAG, 'User login successful');
      return res.data;
    } catch (error) {
      logger.error(TAG, 'Login failed', error);
      throw error;
    }
  },

  async providerLogin(email: string, password: string): Promise<AuthResponse> {
    try {
      const res = await api.post('/auth/provider/login', { email, password });
      await AsyncStorage.setItem(STORAGE_KEYS.USER_TOKEN, res.data.token);
      await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(res.data.user));
      logger.info(TAG, 'Provider login successful');
      return res.data;
    } catch (error) {
      logger.error(TAG, 'Provider login failed', error);
      throw error;
    }
  },

  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      logger.error(TAG, 'Error getting current user', error);
      return null;
    }
  },

  async isAuthenticated(): Promise<boolean> {
    try {
      const token = await AsyncStorage.getItem(STORAGE_KEYS.USER_TOKEN);
      return !!token;
    } catch (error) {
      return false;
    }
  },

  async isProvider(): Promise<boolean> {
    const user = await this.getCurrentUser();
    return user?.role === 'provider';
  },

  async logout(): Promise<void> {
    try {
      try {
        await api.post('/auth/logout', {});
      } catch (error) {
        logger.warn(TAG, 'Logout API call failed', error);
      }
      await AsyncStorage.removeItem(STORAGE_KEYS.USER_TOKEN);
      await AsyncStorage.removeItem(STORAGE_KEYS.USER_DATA);
      logger.info(TAG, 'Logout successful');
    } catch (error) {
      logger.error(TAG, 'Logout error', error);
      try {
        await AsyncStorage.removeItem(STORAGE_KEYS.USER_TOKEN);
        await AsyncStorage.removeItem(STORAGE_KEYS.USER_DATA);
      } catch (e) {
        logger.error(TAG, 'Failed to clear storage', e);
      }
    }
  },
};