import apiClient from '../../services/apiClient';

export const cartService = {
  http: apiClient,
  getCart: async () => {
    const { data } = await apiClient.get('/cart');
    return data.cart;
  },
  addToCart: async (payload: any) => {
    const { data } = await apiClient.post('/cart', payload);
    return data.cart;
  },
  updateCart: async (id: number, quantity: number) => {
    const { data } = await apiClient.put(`/cart/${id}`, { quantity });
    return data.cart;
  },
  removeFromCart: async (id: number) => {
    const { data } = await apiClient.delete(`/cart/${id}`);
    return data.cart;
  },
};
