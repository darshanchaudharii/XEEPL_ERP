/**
 * Date formatting utility
 * Formats dates to yyyy/mm/dd format
 */

/**
 * Format a date value to yyyy/mm/dd format
 * @param {string|number|Date} dateValue - Date value (string, number, or Date object)
 * @returns {string} Formatted date in yyyy/mm/dd format or '—' if invalid
 */
export const formatDateToYYYYMMDD = (dateValue) => {
  if (!dateValue) return '—';
  
  let date;
  
  // Handle different input types
  if (dateValue instanceof Date) {
    date = dateValue;
  } else if (typeof dateValue === 'number' || /^\d+$/.test(String(dateValue))) {
    // Handle timestamp (milliseconds)
    date = new Date(Number(dateValue));
  } else if (typeof dateValue === 'string') {
    // Handle string dates
    // If it's already in YYYY-MM-DD format, convert it
    if (/^\d{4}-\d{2}-\d{2}/.test(dateValue)) {
      const parts = dateValue.split('T')[0].split('-');
      return `${parts[0]}/${parts[1]}/${parts[2]}`;
    }
    date = new Date(dateValue);
  } else {
    return '—';
  }
  
  // Check if date is valid
  if (isNaN(date.getTime())) {
    return '—';
  }
  
  // Format to yyyy/mm/dd
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}/${month}/${day}`;
};

/**
 * Format a date value from backend (YYYY-MM-DD) to yyyy/mm/dd
 * @param {string} dateString - Date string in YYYY-MM-DD format
 * @returns {string} Formatted date in yyyy/mm/dd format
 */
export const formatDateString = (dateString) => {
  if (!dateString) return '—';
  
  // If already in YYYY-MM-DD format, convert to yyyy/mm/dd
  if (/^\d{4}-\d{2}-\d{2}/.test(dateString)) {
    return dateString.replace(/-/g, '/');
  }
  
  // Otherwise, parse and format
  return formatDateToYYYYMMDD(dateString);
};

/**
 * Convert date to YYYY-MM-DD format for date inputs
 * @param {string|number|Date} dateValue - Date value
 * @returns {string} Date in YYYY-MM-DD format
 */
export const formatDateForInput = (dateValue) => {
  if (!dateValue) return '';
  
  // If already in YYYY-MM-DD format, return as is
  if (typeof dateValue === 'string' && /^\d{4}-\d{2}-\d{2}/.test(dateValue)) {
    return dateValue.split('T')[0];
  }
  
  // If in yyyy/mm/dd format, convert to YYYY-MM-DD
  if (typeof dateValue === 'string' && /^\d{4}\/\d{2}\/\d{2}/.test(dateValue)) {
    return dateValue.replace(/\//g, '-');
  }
  
  let date;
  if (dateValue instanceof Date) {
    date = dateValue;
  } else if (typeof dateValue === 'number') {
    date = new Date(dateValue);
  } else {
    date = new Date(dateValue);
  }
  
  if (isNaN(date.getTime())) {
    return '';
  }
  
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};

