import api from '../config/api';

export interface Stats {
  users: number;
  providers: number;
  bookings: number;
  categories: number;
}

export const statsService = {
  async getStats(): Promise<Stats> {
    const res = await api.get('/stats');
    return res.data;
  }
};