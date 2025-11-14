import { ENDPOINTS } from '../utils/constants';
import { get, post, put, del } from './api';

export const sectionService = {
  getAllSections: async () => {
    return await get(ENDPOINTS.SECTIONS);
  },

  getSectionById: async (id) => {
    return await get(`${ENDPOINTS.SECTIONS}/${id}`);
  },

  createSection: async (sectionData) => {
    return await post(ENDPOINTS.SECTIONS, sectionData);
  },

  updateSection: async (id, sectionData) => {
    return await put(`${ENDPOINTS.SECTIONS}/${id}`, sectionData);
  },

  deleteSection: async (id) => {
    return await del(`${ENDPOINTS.SECTIONS}/${id}`);
  }
};