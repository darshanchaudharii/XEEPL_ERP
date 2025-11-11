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

    // Handle no content responses
    if (response.status === 204) {
      return null;
    }

    // Check if response is JSON
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
          // If JSON parsing fails, use default message
        }
      } else {
        // Response is HTML or other non-JSON content
        try {
          const text = await response.text();
          if (response.status === 404) {
            errorMessage = `Endpoint not found: ${endpoint}. The API endpoint may not exist or the server is not configured correctly.`;
          } else if (response.status === 500) {
            errorMessage = `Server error (500): ${endpoint}. The server encountered an error processing your request. Please check the server logs for details.`;
            // Try to extract error message from HTML if possible
            const match = text.match(/<title>(.*?)<\/title>/i) || text.match(/<h1>(.*?)<\/h1>/i);
            if (match) {
              errorMessage += ` Server message: ${match[1]}`;
            }
          } else {
            errorMessage = `Request failed with status ${response.status}. The server returned HTML instead of JSON.`;
          }
        } catch (e) {
          // If text reading fails, use default message
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

// GET request
export const get = (endpoint) => {
  return fetchAPI(endpoint, {
    method: 'GET'
  });
};

// POST request with JSON body or FormData
export const post = (endpoint, data) => {
  return fetchAPI(endpoint, {
    method: 'POST',
    // Remove Content-Type header for FormData (browser sets it automatically with boundary)
    headers: data instanceof FormData ? {} : {
      'Content-Type': 'application/json'
    },
    body: data instanceof FormData ? data : JSON.stringify(data)
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

// PATCH request with JSON body
export const patch = (endpoint, data) => {
  return fetchAPI(endpoint, {
    method: 'PATCH',
    headers: data instanceof FormData ? {} : {
      'Content-Type': 'application/json'
    },
    body: data instanceof FormData ? data : JSON.stringify(data)
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