import { ENDPOINTS } from '../utils/constants';
import { get, post, put, del } from './api';

export const itemService = {
  // Get all items
  getAllItems: async () => {
    return await get(ENDPOINTS.ITEMS);
  },

  // Get item by ID
  getItemById: async (id) => {
    return await get(`${ENDPOINTS.ITEMS}/${id}`);
  },

  // Create item
  createItem: async (itemData) => {
    return await post(ENDPOINTS.ITEMS, itemData);
  },

  // Update item
  updateItem: async (id, itemData) => {
    return await put(`${ENDPOINTS.ITEMS}/${id}`, itemData);
  },

  // Delete item
  deleteItem: async (id) => {
    return await del(`${ENDPOINTS.ITEMS}/${id}`);
  }
};