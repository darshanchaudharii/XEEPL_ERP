import { API_BASE_URL, ENDPOINTS } from '../utils/constants';
import { get, post, put, del, downloadFile } from './api';

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
      Object.keys(catalogData).forEach(key => {
        formData.append(key, catalogData[key]);
      });
      formData.append('file', file);
      return await post(ENDPOINTS.CATALOGS, formData);
    }
    return await post(ENDPOINTS.CATALOGS, catalogData);
  },

  // Update catalog
  updateCatalog: async (id, catalogData, file = null) => {
    if (file) {
      const formData = new FormData();
      Object.keys(catalogData).forEach(key => {
        formData.append(key, catalogData[key]);
      });
      formData.append('file', file);
      return await put(`${ENDPOINTS.CATALOGS}/${id}`, formData);
    }
    return await put(`${ENDPOINTS.CATALOGS}/${id}`, catalogData);
  },

  // Delete catalog
  deleteCatalog: async (id) => {
    return await del(`${ENDPOINTS.CATALOGS}/${id}`);
  },

  // Download catalog file
  downloadCatalogFile: async (catalog) => {
    // Prefer backend-provided absolute URL; fall back to known pattern
    const rawUrl = catalog.downloadUrl
      ? catalog.downloadUrl
      : `${API_BASE_URL}${ENDPOINTS.CATALOGS}/download/catalog-files/${catalog.fileName}`;

    const filename = catalog.fileName || (rawUrl.split('/').pop() || 'download');

    // If absolute URL, bypass proxy and let the browser handle streaming directly
    if (/^https?:\/\//i.test(rawUrl)) {
      const link = document.createElement('a');
      link.href = rawUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      return;
    }

    // Otherwise, normalize to endpoint and use blob download
    let pathname = rawUrl;
    try {
      pathname = new URL(rawUrl, window.location.origin).pathname;
    } catch (_) {}

    const endpoint = pathname.startsWith(API_BASE_URL)
      ? pathname.slice(API_BASE_URL.length)
      : pathname;

    console.log('Catalog download (proxied):', { rawUrl, pathname, endpoint, filename });
    await downloadFile(endpoint, filename);
  }
};

