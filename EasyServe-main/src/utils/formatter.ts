export const formatters = {
  currency: (amount: number): string => {
    return `Rs. ${amount.toLocaleString('en-PK', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })}`;
  },

  date: (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-PK', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  },

  dateTime: (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleString('en-PK', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  },

  time: (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-PK', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  },

  truncate: (text: string, length: number = 50): string => {
    return text.length > length ? text.substring(0, length) + '...' : text;
  },

  phoneNumber: (phone: string): string => {
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.slice(-10); // Return last 10 digits
  },

  percentage: (value: number, total: number): string => {
    return `${Math.round((value / total) * 100)}%`;
  },

  rating: (rating: number | undefined): string => {
    return rating ? rating.toFixed(1) : 'N/A';
  },
};