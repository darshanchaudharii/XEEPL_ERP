import { ENDPOINTS } from '../utils/constants';
import { get, post, put, del, patch, downloadFile } from './api';

export const quotationService = {
  getAllQuotations: async () => {
    return await get(ENDPOINTS.QUOTATIONS);
  },

  getQuotationById: async (id) => {
    return await get(`${ENDPOINTS.QUOTATIONS}/${id}`);
  },

  getQuotationByIdWithRemoved: async (id, includeRemoved = false) => {
    const q = includeRemoved ? `?includeRemoved=true` : '';
    return await get(`${ENDPOINTS.QUOTATIONS}/${id}${q}`);
  },

  createQuotation: async (quotationData) => {
    return await post(ENDPOINTS.QUOTATIONS, quotationData);
  },

  updateQuotation: async (id, quotationData) => {
    return await put(`${ENDPOINTS.QUOTATIONS}/${id}`, quotationData);
  },

  assignCustomer: async (id, customerId) => {
    const current = await get(`${ENDPOINTS.QUOTATIONS}/${id}`);
    const payload = {
      name: current.name,
      date: current.date,
      expiryDate: current.expiryDate,
      status: current.status,
      customerId: customerId ? Number(customerId) : null,
      catalogIds: (current.linkedCatalogs || []).map(c => c.id),
      items: (current.items || []).map(line => ({
        id: line.id,
        itemDescription: line.itemDescription,
        quantity: line.quantity,
        unitPrice: line.unitPrice
      }))
    };
    return await put(`${ENDPOINTS.QUOTATIONS}/${id}`, payload);
  },

  deleteQuotation: async (id) => {
    return await del(`${ENDPOINTS.QUOTATIONS}/${id}`);
  },

editLine: async (lineId, data) => {
  return await patch(`${ENDPOINTS.QUOTATIONS}/lines/${lineId}`, data);
},

removeLine: async (lineId) => {
  return await patch(`${ENDPOINTS.QUOTATIONS}/lines/${lineId}/remove`, {});
},

undoRemoveLine: async (lineId) => {
  return await patch(`${ENDPOINTS.QUOTATIONS}/lines/${lineId}/undo`, {});
},

downloadLinkedCatalogsZip: async (quotationId) => {
  const endpoint = `${ENDPOINTS.QUOTATIONS}/${quotationId}/catalogs-zip`;
  await downloadFile(endpoint, `quotation_${quotationId}_catalogs.zip`);
},
linkCatalogs: async (quotationId, catalogIds) => {
  const body = { catalogIds };
  const endpoint = `${ENDPOINTS.QUOTATIONS}/${quotationId}/link-catalogs`;
  try {
    return await post(endpoint, body);
  } catch (e) {
    return await put(endpoint, body);
  }
},
  exportQuotationPDF: async (id) => {
    await downloadFile(
      `${ENDPOINTS.QUOTATIONS}/${id}/export-pdf`,
      `quotation_${id}.pdf`
    );
  }
};