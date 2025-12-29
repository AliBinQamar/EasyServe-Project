import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../config/api';
import { AuthUser } from '../types';
import { STORAGE_KEYS } from '../utils/constants';
import { logger } from '../utils/logger';

const TAG = 'ProfileService';

export const profileService = {
  /* ================= GET PROFILE ================= */
  async getProfile(): Promise<AuthUser> {
    try {
      const res = await api.get('/auth/me');

      // keep local user in sync
      await AsyncStorage.setItem(
        STORAGE_KEYS.USER_DATA,
        JSON.stringify(res.data)
      );

      logger.info(TAG, 'Profile fetched');
      return res.data;
    } catch (error) {
      logger.error(TAG, 'Get profile failed', error);
      throw error;
    }
  },

  /* ================= UPDATE PROFILE ================= */
  async updateProfile(data: Partial<AuthUser>): Promise<AuthUser> {
    try {
      /**
       * 🔴 IMPORTANT
       * Backend should support:
       * PUT /api/auth/profile
       * or
       * PATCH /api/auth/profile
       */

      const res = await api.put('/auth/profile', data);

      // sync updated profile locally
      await AsyncStorage.setItem(
        STORAGE_KEYS.USER_DATA,
        JSON.stringify(res.data)
      );

      logger.info(TAG, 'Profile updated');
      return res.data;
    } catch (error: any) {
      logger.error(TAG, 'Update profile failed', error);
      throw error?.response?.data || error;
    }
  },
};
