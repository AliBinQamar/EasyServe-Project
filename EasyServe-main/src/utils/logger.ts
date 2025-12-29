export const logger = {
  info: (tag: string, message: string, data?: any) => {
    if (__DEV__) {
      console.log(`✅ [${tag}] ${message}`, data || '');
    }
  },

  error: (tag: string, message: string, error?: any) => {
    console.error(`❌ [${tag}] ${message}`, error || '');
  },

  warn: (tag: string, message: string, data?: any) => {
    console.warn(`⚠️  [${tag}] ${message}`, data || '');
  },

  debug: (tag: string, message: string, data?: any) => {
    if (__DEV__) {
      console.debug(`🔍 [${tag}] ${message}`, data || '');
    }
  },
};
