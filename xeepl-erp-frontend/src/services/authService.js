import { post } from './api';

const AUTH_TOKEN_KEY = 'auth_token';
const USER_KEY = 'user_data';

export const authService = {
  login: async (username, password) => {
    try {
      const response = await post('/auth/login', {
        username,
        password,
      });
      
      if (response.token) {
        localStorage.setItem(AUTH_TOKEN_KEY, response.token);
        localStorage.setItem(USER_KEY, JSON.stringify({
          username: response.username,
          fullName: response.fullName,
          role: response.role,
          email: response.email,
        }));
        return response;
      }
      throw new Error('Login failed');
    } catch (error) {
      throw error.message || 'Login failed';
    }
  },

  logout: () => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  getToken: () => {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  },

  getUser: () => {
    const userData = localStorage.getItem(USER_KEY);
    return userData ? JSON.parse(userData) : null;
  },

  isAuthenticated: () => {
    return !!localStorage.getItem(AUTH_TOKEN_KEY);
  },

  isAdmin: () => {
    const user = authService.getUser();
    return user && user.role === 'Admin';
  },
};

export default authService;

