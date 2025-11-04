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

  // Export quotation as PDF
  exportQuotationPDF: async (id) => {
    await downloadFile(
      `${ENDPOINTS.QUOTATIONS}/${id}/export-pdf`,
      `quotation_${id}.pdf`
    );
  }
};