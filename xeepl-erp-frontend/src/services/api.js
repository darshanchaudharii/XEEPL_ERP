import { API_BASE_URL } from '../utils/constants';

export const fetchAPI = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const token = localStorage.getItem('auth_token');
  
  try {
    console.log('API Request:', {
      url,
      method: options.method,
      hasBody: !!options.body
    });

    const headers = {
      ...options.headers
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers
    });

    if (response.status === 204) {
      return null;
    }

    const contentType = response.headers.get('content-type');
    const isJson = contentType && contentType.includes('application/json');

    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      let errorDetails = null;
      
      if (isJson) {
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
          errorDetails = errorData;
        } catch (e) {
        }
      } else {
        try {
          const text = await response.text();
          if (response.status === 404) {
            errorMessage = `Endpoint not found: ${endpoint}. The API endpoint may not exist or the server is not configured correctly.`;
          } else if (response.status === 500) {
            errorMessage = `Server error (500): ${endpoint}. The server encountered an error processing your request. Please check the server logs for details.`;
            const match = text.match(/<title>(.*?)<\/title>/i) || text.match(/<h1>(.*?)<\/h1>/i);
            if (match) {
              errorMessage += ` Server message: ${match[1]}`;
            }
          } else {
            errorMessage = `Request failed with status ${response.status}. The server returned HTML instead of JSON.`;
          }
        } catch (e) {
        }
      }
      
      const error = new Error(errorMessage);
      if (errorDetails) {
        error.details = errorDetails;
      }
      error.status = response.status;
      throw error;
    }

    if (!isJson) {
      throw new Error(`Expected JSON response but received ${contentType || 'unknown content type'} from ${endpoint}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API Error Details:', {
      endpoint,
      url,
      error: error.message,
      stack: error.stack
    });
    throw error;
  }
};

export const get = (endpoint) => {
  return fetchAPI(endpoint, {
    method: 'GET'
  });
};

export const post = (endpoint, data) => {
  return fetchAPI(endpoint, {
    method: 'POST',
    headers: data instanceof FormData ? {} : {
      'Content-Type': 'application/json'
    },
    body: data instanceof FormData ? data : JSON.stringify(data)
  });
};

export const postFormData = (endpoint, formData) => {
  return fetchAPI(endpoint, {
    method: 'POST',
    body: formData
  });
};

export const put = async (endpoint, data) => {
  return fetchAPI(endpoint, {
    method: 'PUT',
    headers: data instanceof FormData ? {} : {
      'Content-Type': 'application/json'
    },
    body: data instanceof FormData ? data : JSON.stringify(data)
  });
};

export const putFormData = (endpoint, formData) => {
  return fetchAPI(endpoint, {
    method: 'PUT',
    body: formData
  });
};

export const patch = (endpoint, data) => {
  return fetchAPI(endpoint, {
    method: 'PATCH',
    headers: data instanceof FormData ? {} : {
      'Content-Type': 'application/json'
    },
    body: data instanceof FormData ? data : JSON.stringify(data)
  });
};

export const del = (endpoint) => {
  return fetchAPI(endpoint, {
    method: 'DELETE'
  });
};

export const downloadFile = async (endpoint, filename) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const token = localStorage.getItem('auth_token');
  
  try {
    const headers = {};
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(url, {
      method: 'GET',
      headers: headers
    });
    
    if (!response.ok) {
      let errorMessage = `Download failed with status: ${response.status}`;
      try {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } else {
          const text = await response.text();
          if (text) {
            errorMessage += ` - ${text.substring(0, 200)}`;
          }
        }
      } catch (e) {
      }
      throw new Error(errorMessage);
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      try {
        const errorData = await response.json();
        throw new Error(errorData.message || errorData.error || 'Download failed: Server returned JSON instead of file');
      } catch (e) {
        if (e.message.includes('Download failed')) {
          throw e;
        }
      }
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