export const validators = {
  email: (email: string): boolean => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  },

  password: (password: string): { valid: boolean; error?: string } => {
    if (!password) return { valid: false, error: 'Password is required' };
    if (password.length < 6) {
      return { valid: false, error: 'Password must be at least 6 characters' };
    }
    return { valid: true };
  },

  phone: (phone: string): boolean => {
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.length >= 10;
  },

  price: (price: string): { valid: boolean; error?: string } => {
    const num = parseInt(price, 10);
    if (isNaN(num)) return { valid: false, error: 'Invalid number' };
    if (num <= 0) return { valid: false, error: 'Price must be greater than 0' };
    return { valid: true };
  },

  name: (name: string): boolean => {
    return name.trim().length >= 2;
  },

  url: (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },

  bidAmount: (amount: string): { valid: boolean; error?: string } => {
    const num = parseFloat(amount);
    if (isNaN(num)) return { valid: false, error: 'Invalid bid amount' };
    if (num <= 0) return { valid: false, error: 'Bid must be greater than 0' };
    return { valid: true };
  },
};