import AsyncStorage from '@react-native-async-storage/async-storage';
import { logger } from './logger';

const TAG = 'StorageUtil';

export const storage = {
  async set(key: string, value: any): Promise<void> {
    try {
      const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
      await AsyncStorage.setItem(key, stringValue);
      logger.debug(TAG, `Saved: ${key}`);
    } catch (error) {
      logger.error(TAG, `Failed to save ${key}`, error);
    }
  },

  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await AsyncStorage.getItem(key);
      if (!value) return null;

      try {
        return JSON.parse(value) as T;
      } catch {
        return value as T;
      }
    } catch (error) {
      logger.error(TAG, `Failed to get ${key}`, error);
      return null;
    }
  },

  async remove(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
      logger.debug(TAG, `Removed: ${key}`);
    } catch (error) {
      logger.error(TAG, `Failed to remove ${key}`, error);
    }
  },

  async clear(): Promise<void> {
    try {
      await AsyncStorage.clear();
      logger.info(TAG, 'Storage cleared');
    } catch (error) {
      logger.error(TAG, 'Failed to clear storage', error);
    }
  },

async getAllKeys(): Promise<readonly string[]> {
  try {
    return await AsyncStorage.getAllKeys();
  } catch (error) {
    logger.error(TAG, 'Failed to get all keys', error);
    return [];
  }
}

};