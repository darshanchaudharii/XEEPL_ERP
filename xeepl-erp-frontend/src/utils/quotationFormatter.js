/**
 * Helper utility for formatting quotation lines hierarchically
 * Groups items with their raw materials and enriches with descriptions
 */

/**
 * Get item description from items list by matching itemId or itemDescription
 * @param {Object} line - Quotation line
 * @param {Array} items - List of all items
 * @returns {string} - Item description
 */
export const getItemDescription = (line, items) => {
  if (!line || !items) return '';
  
  // Try to find by itemId first
  if (line.itemId) {
    const item = items.find(i => i.id === line.itemId);
    if (item) {
      return item.description || item.itemDescription || '';
    }
  }
  
  // Fallback: try to match by itemDescription (name)
  if (line.itemDescription) {
    const itemName = line.itemDescription.replace(' (Raw Material)', '');
    const item = items.find(i => i.itemName === itemName || i.itemName === line.itemDescription);
    if (item) {
      return item.description || item.itemDescription || '';
    }
  }
  
  // Use itemLongDescription if available (from frontend enrichment)
  return line.itemLongDescription || '';
};

/**
 * Get raw material description from rawMaterials list
 * @param {Object} line - Quotation line (raw material)
 * @param {Array} rawMaterials - List of all raw materials
 * @returns {string} - Raw material description
 */
export const getRawMaterialDescription = (line, rawMaterials) => {
  if (!line || !rawMaterials || !line.isRawMaterial) return '';
  
  // Try to find by rawId first
  if (line.rawId) {
    const raw = rawMaterials.find(r => r.id === line.rawId);
    if (raw) {
      return raw.description || '';
    }
  }
  
  // Fallback: try to match by name from itemDescription
  if (line.itemDescription) {
    const rawName = line.itemDescription.replace(' (Raw Material)', '').trim();
    const raw = rawMaterials.find(r => r.name === rawName);
    if (raw) {
      return raw.description || '';
    }
  }
  
  return '';
};

/**
 * Group quotation lines hierarchically: items with their nested raw materials
 * This function ensures raw materials are grouped under their parent items
 * and NEVER displayed as separate top-level rows
 * 
 * @param {Array} quotationLines - All active quotation lines (non-removed)
 * @param {Array} removedLines - Removed lines (for frontend soft delete)
 * @param {boolean} showRemovedRaws - Whether to include removed raws
 * @returns {Array} - Grouped lines with structure: [{ item, raws: [...] }]
 */
export const groupQuotationLines = (quotationLines = [], removedLines = [], showRemovedRaws = false) => {
  // Get all items (non-raw materials, non-removed)
  // These will be the numbered parent rows (1, 2, 3...)
  const items = quotationLines.filter(l => {
    // Only include lines that are NOT raw materials and NOT removed
    // This ensures raw materials are NEVER displayed as top-level numbered rows
    return !l.isRawMaterial && !l.removed;
  });
  
  // Get all raw materials (active and removed if showRemovedRaws is true)
  // These will be nested as lettered sub-rows (a), b), c)...) under their parent items
  const activeRaws = quotationLines.filter(l => l.isRawMaterial && !l.removed);
  const removedRaws = showRemovedRaws ? removedLines.filter(l => l.isRawMaterial) : [];
  const allRaws = [...activeRaws, ...removedRaws];
  
  // Group raws by parentItemId - match each raw material to its parent item
  // This creates the hierarchical structure: Item -> Raw Materials
  return items.map(item => {
    const raws = allRaws
      .filter(raw => {
        // Match raw materials to their parent item using parentItemId
        // Handle multiple comparison methods to account for type mismatches (number vs string)
        if (raw.parentItemId == null || raw.parentItemId === undefined) {
          return false; // Skip raws without a parent (orphaned raws won't be displayed)
        }
        
        const parentId = Number(raw.parentItemId);
        const itemId = Number(item.id);
        
        // Try multiple comparison methods for robust matching
        return parentId === itemId || 
               String(raw.parentItemId) === String(item.id) ||
               raw.parentItemId == item.id; // Loose equality for type coercion
      })
      .sort((a, b) => Number(a.id) - Number(b.id)); // Sort by ID to maintain original order (a, b, c...)
    
    return {
      item,
      raws
    };
  });
};

