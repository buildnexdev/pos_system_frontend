import apiClient from '../../services/apiClient';

export const shopService = {
  http: apiClient,
  getHome: async () => {
    const { data } = await apiClient.get('/home');
    return data;
  },
  getProducts: async (filters: Record<string, any> = {}) => {
    const { data } = await apiClient.get('/products', { params: filters });
    return data;
  },
  getProduct: async (slug: string) => {
    const { data } = await apiClient.get(`/products/${slug}`);
    return data;
  },
  getCategories: async () => {
    const { data } = await apiClient.get('/categories');
    return data;
  },
  getWishlist: async () => {
    const { data } = await apiClient.get('/wishlist');
    return data;
  },
  removeWishlist: async (id: string | number) => {
    const { data } = await apiClient.delete(`/wishlist/${id}`);
    return data;
  },
  toggleWishlist: async (productId: string | number) => {
    const { data } = await apiClient.post('/wishlist/toggle', { product_id: productId });
    return data;
  },
};

export const shopServices = shopService;
