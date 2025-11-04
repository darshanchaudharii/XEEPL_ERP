import { ENDPOINTS } from '../utils/constants';
import { 
  get, 
  postFormData, 
  put, 
  del
} from './api';

export const contentService = {
  // Get all contents
  getAllContents: async (sectionId = null) => {
    const endpoint = sectionId 
      ? `${ENDPOINTS.CONTENTS}?sectionId=${sectionId}` 
      : ENDPOINTS.CONTENTS;
    return await get(endpoint);
  },

  // Get content by ID
  getContentById: async (id) => {
    return await get(`${ENDPOINTS.CONTENTS}/${id}`);
  },

  // Create content
  createContent: async (contentData, imageFile) => {
    const formData = new FormData();
    
    // Append each field individually
    Object.keys(contentData).forEach(key => {
      if (contentData[key] !== null && contentData[key] !== undefined) {
        formData.append(key, contentData[key]);
      }
    });
    
    if (imageFile) {
      formData.append('image', imageFile);
    }

    return await postFormData(ENDPOINTS.CONTENTS, formData);
  },
   updateContent:async (id, contentData, imageFile) => {
    const formData = new FormData();
    
    // Create content DTO object with proper type conversions
    const contentDto = {
      sectionId: parseInt(contentData.sectionId),
      title: contentData.title,
      sequence: parseInt(contentData.sequence) || 0,
      description: contentData.description || '',
      altTag: contentData.altTag || '',
      link: contentData.link || ''
    };

    // Add contentDto as JSON Blob (ensures Spring @RequestPart parsing)
    formData.append(
      'contentDto',
      new Blob([JSON.stringify(contentDto)], { type: 'application/json' })
    );

    // Add image file if present
    if (imageFile) {
      formData.append('imageFile', imageFile);
    }

    console.log('Update Content Request:', { id, contentDto, hasFile: !!imageFile });

    return await put(`${ENDPOINTS.CONTENTS}/${id}`, formData);
    },
  

  // Delete content
  deleteContent: async (id) => {
    return await del(`${ENDPOINTS.CONTENTS}/${id}`);
  }
};