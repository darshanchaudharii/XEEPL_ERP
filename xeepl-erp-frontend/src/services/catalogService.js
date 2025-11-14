import { API_BASE_URL, ENDPOINTS } from '../utils/constants';
import { get, post, postFormData, put, putFormData, del, downloadFile } from './api';

export const catalogService = {
  getAllCatalogs: async () => {
    return await get(ENDPOINTS.CATALOGS);
  },

  getCatalogById: async (id) => {
    return await get(`${ENDPOINTS.CATALOGS}/${id}`);
  },

  createCatalog: async (catalogData, file = null) => {
    if (file) {
      const formData = new FormData();
      formData.append('metadata', new Blob([JSON.stringify(catalogData)], {
        type: 'application/json'
      }));
      formData.append('file', file);
      return await postFormData(ENDPOINTS.CATALOGS, formData);
    }
    return await post(ENDPOINTS.CATALOGS, catalogData);
  },

  updateCatalog: async (id, catalogData, file = null) => {
    const formData = new FormData();
    formData.append('metadata', new Blob([JSON.stringify(catalogData)], {
      type: 'application/json'
    }));
    if (file) {
      formData.append('file', file);
    }
    return await putFormData(`${ENDPOINTS.CATALOGS}/${id}`, formData);
  },

  deleteCatalog: async (id) => {
    return await del(`${ENDPOINTS.CATALOGS}/${id}`);
  },

  downloadCatalogFile: async (catalog) => {
    const endpoint = `${ENDPOINTS.CATALOGS}/download/files/${catalog.id}`;
    const filename = catalog.fileName || 'download';

    console.log('Downloading catalog file:', { endpoint, filename, catalog });
    await downloadFile(endpoint, filename);
  }
};

