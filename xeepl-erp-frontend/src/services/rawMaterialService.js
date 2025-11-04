import { ENDPOINTS } from '../utils/constants';
import { get, post, put, del } from './api';

export const rawMaterialService = {
  // Get all raw materials
  getAllRawMaterials: async (itemId = null, supplierId = null) => {
    let endpoint = ENDPOINTS.RAW_MATERIALS;
    const params = [];
    
    if (itemId) params.push(`itemId=${itemId}`);
    if (supplierId) params.push(`supplierId=${supplierId}`);
    
    if (params.length > 0) {
      endpoint += `?${params.join('&')}`;
    }
    
    return await get(endpoint);
  },

  // Get raw material by ID
  getRawMaterialById: async (id) => {
    return await get(`${ENDPOINTS.RAW_MATERIALS}/${id}`);
  },

  // Create raw material
  createRawMaterial: async (rawMaterialData) => {
    return await post(ENDPOINTS.RAW_MATERIALS, rawMaterialData);
  },

  // Update raw material
  updateRawMaterial: async (id, rawMaterialData) => {
    return await put(`${ENDPOINTS.RAW_MATERIALS}/${id}`, rawMaterialData);
  },

  // Delete raw material
  deleteRawMaterial: async (id) => {
    return await del(`${ENDPOINTS.RAW_MATERIALS}/${id}`);
  }
};