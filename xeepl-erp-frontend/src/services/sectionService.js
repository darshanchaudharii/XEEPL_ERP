import { ENDPOINTS } from '../utils/constants';
import { get, post, put, del } from './api';

export const sectionService = {
  // Get all sections
  getAllSections: async () => {
    return await get(ENDPOINTS.SECTIONS);
  },

  // Get section by ID
  getSectionById: async (id) => {
    return await get(`${ENDPOINTS.SECTIONS}/${id}`);
  },

  // Create section
  createSection: async (sectionData) => {
    return await post(ENDPOINTS.SECTIONS, sectionData);
  },

  // Update section
  updateSection: async (id, sectionData) => {
    return await put(`${ENDPOINTS.SECTIONS}/${id}`, sectionData);
  },

  // Delete section
  deleteSection: async (id) => {
    return await del(`${ENDPOINTS.SECTIONS}/${id}`);
  }
};