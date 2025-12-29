export const API_CONFIG = {
  TIMEOUT: 15000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
};

export const VALIDATION = {
  MIN_PASSWORD_LENGTH: 6,
  MIN_PRICE: 100,
  MAX_PRICE: 1000000,
  MAX_DESCRIPTION_LENGTH: 1000,
  MAX_BID_NOTE_LENGTH: 500,
  MAX_IMAGES_PER_BID: 5,
};

export const STORAGE_KEYS = {
  USER_TOKEN: 'userToken',
  USER_DATA: 'userData',
  USER_ROLE: 'userRole',
  CACHE_PROVIDERS: 'cachedProviders',
  CACHE_CATEGORIES: 'cachedCategories',
  CACHE_TIMEOUT: 3600000, // 1 hour in ms
};

export const STATUS_COLORS: { [key: string]: string } =  {
  open: '#2196F3',
  bidding: '#FF9800',
  assigned: '#9C27B0',
  'in-progress': '#FF9800',
  completed: '#4CAF50',
  cancelled: '#F44336',
  disputed: '#FF5722',
  pending: '#FF9800',
  confirmed: '#4CAF50',
  rejected: '#F44336',
};

export const STATUS_ICONS: { [key: string]: string } = {
  open: '🔓',
  bidding: '💰',
  assigned: '✅',
  'in-progress': '⏳',
  completed: '✓',
  cancelled: '✕',
  disputed: '⚠️',
};

export const REQUEST_TYPES = {
  FIXED: 'fixed',
  BIDDING: 'bidding',
};

export const USER_ROLES = {
  USER: 'user',
  PROVIDER: 'provider',
};