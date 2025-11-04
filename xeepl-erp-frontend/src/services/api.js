import { API_BASE_URL } from '../utils/constants';

// Generic fetch wrapper
export const fetchAPI = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  try {
    console.log('API Request:', {
      url,
      method: options.method,
      hasBody: !!options.body
    });

    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        message: `HTTP error! status: ${response.status}`
      }));
      throw new Error(errorData.message || `Request failed with status ${response.status}`);
    }

    // Handle no content responses
    if (response.status === 204) {
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('API Error Details:', {
      endpoint,
      error: error.message,
      stack: error.stack
    });
    throw error;
  }
};

// GET request
export const get = (endpoint) => {
  return fetchAPI(endpoint, {
    method: 'GET'
  });
};

// POST request with JSON body
export const post = (endpoint, data) => {
  return fetchAPI(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
};

// POST request with FormData (for file uploads)
export const postFormData = (endpoint, formData) => {
  return fetchAPI(endpoint, {
    method: 'POST',
    body: formData
  });
};

// PUT request with JSON body
export const put = async (endpoint, data) => {
  return fetchAPI(endpoint, {
    method: 'PUT',
    // Remove Content-Type header for FormData
    headers: data instanceof FormData ? {} : {
      'Content-Type': 'application/json'
    },
    body: data instanceof FormData ? data : JSON.stringify(data)
  });
};

// PUT request with FormData
export const putFormData = (endpoint, formData) => {
  return fetchAPI(endpoint, {
    method: 'PUT',
    body: formData
  });
};

// DELETE request
export const del = (endpoint) => {
  return fetchAPI(endpoint, {
    method: 'DELETE'
  });
};

// Download file
export const downloadFile = async (endpoint, filename) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error('Download failed');
    }

    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(downloadUrl);
  } catch (error) {
    console.error('Download Error:', error);
    throw error;
  }
};