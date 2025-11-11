import { ENDPOINTS } from '../utils/constants';
import { get, post, put, del, patch, downloadFile } from './api';

export const quotationService = {
  // Get all quotations
  getAllQuotations: async () => {
    return await get(ENDPOINTS.QUOTATIONS);
  },


  // Get quotation by ID
  getQuotationById: async (id) => {
    return await get(`${ENDPOINTS.QUOTATIONS}/${id}`);
  },

  // Get quotation with option to include removed raws
  getQuotationByIdWithRemoved: async (id, includeRemoved = false) => {
    const q = includeRemoved ? `?includeRemoved=true` : '';
    return await get(`${ENDPOINTS.QUOTATIONS}/${id}${q}`);
  },

  // Create quotation
  createQuotation: async (quotationData) => {
    return await post(ENDPOINTS.QUOTATIONS, quotationData);
  },

  // Update quotation
  updateQuotation: async (id, quotationData) => {
    return await put(`${ENDPOINTS.QUOTATIONS}/${id}`, quotationData);
  },

  // Assign/Change customer (PUT with required fields preserved)
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

  // Delete quotation
  deleteQuotation: async (id) => {
    return await del(`${ENDPOINTS.QUOTATIONS}/${id}`);
  },

// Edit a single quotation line (PATCH)
editLine: async (lineId, data) => {
  return await patch(`${ENDPOINTS.QUOTATIONS}/lines/${lineId}`, data);
},

// Remove a line (soft delete)
removeLine: async (lineId) => {
  return await patch(`${ENDPOINTS.QUOTATIONS}/lines/${lineId}/remove`, {});
},

// Undo remove
undoRemoveLine: async (lineId) => {
  return await patch(`${ENDPOINTS.QUOTATIONS}/lines/${lineId}/undo`, {});
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