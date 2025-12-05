import api from '../config/api';

export const categoryService = {
  async getAll() {
    const res = await api.get('/categories');
    return res.data;
  },

  async create(category: any) {
    const res = await api.post('/categories', category);
    return res.data.category;
  },

  async update(id: string, category: any) {
    const res = await api.put(`/categories/${id}`, category);
    return res.data.category;
  },

  async delete(id: string) {
    await api.delete(`/categories/${id}`);
  }
};