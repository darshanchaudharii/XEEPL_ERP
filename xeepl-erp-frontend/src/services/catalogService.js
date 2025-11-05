import { API_BASE_URL, ENDPOINTS } from '../utils/constants';
import { get, post, postFormData, put, putFormData, del, downloadFile } from './api';

export const catalogService = {
  // Get all catalogs
  getAllCatalogs: async () => {
    return await get(ENDPOINTS.CATALOGS);
  },

  // Get catalog by ID
  getCatalogById: async (id) => {
    return await get(`${ENDPOINTS.CATALOGS}/${id}`);
  },

  // Create catalog
  createCatalog: async (catalogData, file = null) => {
    if (file) {
      const formData = new FormData();
      // Backend expects metadata as a JSON object and file separately
      formData.append('metadata', new Blob([JSON.stringify(catalogData)], {
        type: 'application/json'
      }));
      formData.append('file', file);
      return await postFormData(ENDPOINTS.CATALOGS, formData);
    }
    return await post(ENDPOINTS.CATALOGS, catalogData);
  },

  // Update catalog
  updateCatalog: async (id, catalogData, file = null) => {
    if (file) {
      const formData = new FormData();
      // Backend expects metadata as a JSON object and file separately
      formData.append('metadata', new Blob([JSON.stringify(catalogData)], {
        type: 'application/json'
      }));
      formData.append('file', file);
      return await putFormData(`${ENDPOINTS.CATALOGS}/${id}`, formData);
    }
    return await put(`${ENDPOINTS.CATALOGS}/${id}`, catalogData);
  },

  // Delete catalog
  deleteCatalog: async (id) => {
    return await del(`${ENDPOINTS.CATALOGS}/${id}`);
  },

  // Download catalog file
  downloadCatalogFile: async (catalog) => {
    let endpoint = null;
    let filename = catalog.fileName || 'download';

    // Use downloadUrl from backend response if available
    if (catalog.downloadUrl) {
      try {
        // Parse the absolute URL to extract the path
        const url = new URL(catalog.downloadUrl);
        // Extract the path (e.g., "/api/catalogs/download/catalog-files/...")
        endpoint = url.pathname;
        
        // Extract filename from URL if not provided
        if (!catalog.fileName) {
          const pathParts = endpoint.split('/');
          filename = pathParts[pathParts.length - 1] || 'download';
        }
      } catch (e) {
        // If downloadUrl is not a valid absolute URL, treat it as a relative path
        endpoint = catalog.downloadUrl.startsWith('/')
          ? catalog.downloadUrl
          : `/${catalog.downloadUrl}`;
      }
    } else {
      // Fallback: construct the endpoint from fileName
      endpoint = `${ENDPOINTS.CATALOGS}/download/catalog-files/${catalog.fileName}`;
    }

    // Normalize endpoint: ensure it starts with / and remove API_BASE_URL prefix if present
    // (downloadFile will add API_BASE_URL automatically)
    if (endpoint.startsWith(API_BASE_URL)) {
      endpoint = endpoint.slice(API_BASE_URL.length);
    }
    
    // Ensure endpoint starts with /
    if (!endpoint.startsWith('/')) {
      endpoint = `/${endpoint}`;
    }

    console.log('Downloading catalog file:', { endpoint, filename, catalog });
    await downloadFile(endpoint, filename);
  }
};

