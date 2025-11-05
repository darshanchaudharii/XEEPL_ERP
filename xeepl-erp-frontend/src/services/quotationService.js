import { ENDPOINTS } from '../utils/constants';
import { get, post, put, del, downloadFile } from './api';

export const quotationService = {
  // Get all quotations
  getAllQuotations: async () => {
    return await get(ENDPOINTS.QUOTATIONS);
  },


  // Get quotation by ID
  getQuotationById: async (id) => {
    return await get(`${ENDPOINTS.QUOTATIONS}/${id}`);
  },

  // Create quotation
  createQuotation: async (quotationData) => {
    return await post(ENDPOINTS.QUOTATIONS, quotationData);
  },

  // Update quotation
  updateQuotation: async (id, quotationData) => {
    return await put(`${ENDPOINTS.QUOTATIONS}/${id}`, quotationData);
  },

  // Delete quotation
  deleteQuotation: async (id) => {
    return await del(`${ENDPOINTS.QUOTATIONS}/${id}`);
  },

//method for downloading catalogs as ZIP
downloadLinkedCatalogsZip: async (quotationId) => {
  const endpoint = `${ENDPOINTS.QUOTATIONS}/${quotationId}/catalogs-zip`;
  await downloadFile(endpoint, `quotation_${quotationId}_catalogs.zip`);
},
// method to link catalogs (try POST first, fallback to PUT for older backends)
linkCatalogs: async (quotationId, catalogIds) => {
  const body = { catalogIds };
  const endpoint = `${ENDPOINTS.QUOTATIONS}/${quotationId}/link-catalogs`;
  try {
    return await post(endpoint, body);
  } catch (e) {
    // Retry with PUT if POST not supported
    return await put(endpoint, body);
  }
},
 // Export quotation as PDF
  exportQuotationPDF: async (id) => {
    await downloadFile(
      `${ENDPOINTS.QUOTATIONS}/${id}/export-pdf`,
      `quotation_${id}.pdf`
    );
  }
};