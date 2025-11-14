import { ENDPOINTS } from '../utils/constants';
import { get, post, put, del } from './api';

export const itemService = {
  getAllItems: async () => {
    return await get(ENDPOINTS.ITEMS);
  },

  getItemById: async (id) => {
    return await get(`${ENDPOINTS.ITEMS}/${id}`);
  },

  createItem: async (itemData) => {
    return await post(ENDPOINTS.ITEMS, itemData);
  },

  updateItem: async (id, itemData) => {
    return await put(`${ENDPOINTS.ITEMS}/${id}`, itemData);
  },

  deleteItem: async (id) => {
    return await del(`${ENDPOINTS.ITEMS}/${id}`);
  }
};