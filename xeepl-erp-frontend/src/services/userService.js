import { ENDPOINTS } from '../utils/constants';
import { get, postFormData, putFormData, del } from './api';

export const userService = {
  // Get all users
  getAllUsers: async (role = null) => {
    const endpoint = role ? `${ENDPOINTS.USERS}?role=${role}` : ENDPOINTS.USERS;
    return await get(endpoint);
  },
  

  // Get user by ID
  getUserById: async (id) => {
    return await get(`${ENDPOINTS.USERS}/${id}`);
  },

  // Create user
  createUser: async (userData, profilePhoto) => {
    const formData = new FormData();
    formData.append('userDto', new Blob([JSON.stringify(userData)], {
      type: 'application/json'
    }));
    
    if (profilePhoto) {
      formData.append('profilePhoto', profilePhoto);
    }

    return await postFormData(ENDPOINTS.USERS, formData);
  },

  // Update user
  updateUser: async (id, userData, profilePhoto) => {
    const formData = new FormData();
    formData.append('userDto', new Blob([JSON.stringify(userData)], {
      type: 'application/json'
    }));
    
    if (profilePhoto) {
      formData.append('profilePhoto', profilePhoto);
    }

    return await putFormData(`${ENDPOINTS.USERS}/${id}`, formData);
  },

  // Delete user
  deleteUser: async (id) => {
    return await del(`${ENDPOINTS.USERS}/${id}`);
  }
};