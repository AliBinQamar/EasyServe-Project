import api from '../config/api';
import { Provider } from '../types';

export const providerService = {
  async getAll(): Promise<Provider[]> {
    const res = await api.get('/providers');
    return res.data;
  },

  async getByCategory(categoryId: string): Promise<Provider[]> {
    if (!categoryId) throw new Error('Category ID is required');
    const res = await api.get('/providers', { params: { categoryId } });
    return res.data;
  },

  async getById(id: string): Promise<Provider> {
    if (!id) throw new Error('Provider ID is required');
    const res = await api.get(`/providers/${id}`);
    return res.data;
  },

  async create(provider: Partial<Provider>): Promise<Provider> {
    const res = await api.post('/providers', provider);
    return res.data.provider;
  },

  async update(id: string, provider: Partial<Provider>): Promise<Provider> {
    if (!id) throw new Error('Provider ID is required');
    const res = await api.put(`/providers/${id}`, provider);
    return res.data.provider;
  },

  async delete(id: string): Promise<void> {
    if (!id) throw new Error('Provider ID is required');
    await api.delete(`/providers/${id}`);
  },
};
