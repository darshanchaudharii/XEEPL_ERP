import { ENDPOINTS } from '../utils/constants';
import { get, postFormData, putFormData, del } from './api';

export const userService = {
  getAllUsers: async (role = null) => {
    const endpoint = role ? `${ENDPOINTS.USERS}?role=${role}` : ENDPOINTS.USERS;
    return await get(endpoint);
  },

  getUserById: async (id) => {
    return await get(`${ENDPOINTS.USERS}/${id}`);
  },

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

  deleteUser: async (id) => {
    return await del(`${ENDPOINTS.USERS}/${id}`);
  }
};