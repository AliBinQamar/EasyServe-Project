import api from '../config/api';

export const bookingService = {
  async getAll() {
    const res = await api.get('/bookings');
    return res.data;
  },

  async getByUserId(userId: string) {
    const res = await api.get('/bookings', { params: { userId } });
    return res.data;
  },

  async create(booking: any) {
    const res = await api.post('/bookings', booking);
    return res.data.booking;
  },

  async updateStatus(id: string, status: 'pending' | 'confirmed' | 'rejected') {
    const res = await api.put(`/bookings/${id}/status`, { status });
    return res.data.booking;
  }
};