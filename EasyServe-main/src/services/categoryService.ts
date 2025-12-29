import api from '../config/api';
import { Category } from '../types';
import { logger } from '../utils/logger';
import { cacheManager } from '../utils/cache';

const TAG = 'CategoryService';
const CACHE_KEY = 'categories';

export const categoryService = {
  async getAll(): Promise<Category[]> {
    try {
      // Check cache first
      const cached = cacheManager.get<Category[]>(CACHE_KEY);
      if (cached) {
        logger.info(TAG, 'Categories from cache');
        return cached;
      }

      const res = await api.get('/categories');
      const categories = res.data || [];
      
      // Cache for 1 hour
      cacheManager.set(CACHE_KEY, categories, 3600000);
      logger.info(TAG, `Loaded ${categories.length} categories`);
      return categories;
    } catch (error) {
      logger.error(TAG, 'Error fetching categories', error);
      return [];
    }
  },

  async getById(id: string): Promise<Category | null> {
    try {
      const res = await api.get(`/categories/${id}`);
      return res.data;
    } catch (error) {
      logger.error(TAG, 'Error fetching category', error);
      return null;
    }
  },
};