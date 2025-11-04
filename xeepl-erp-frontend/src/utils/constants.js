// API Base URL - Uses proxy in vite.config.js during development
export const API_BASE_URL = '/api';

// API Endpoints
export const ENDPOINTS = {
  USERS: '/users',
  SECTIONS: '/sections',
  CONTENTS: '/contents',
  ITEMS: '/items',
  RAW_MATERIALS: '/raw-materials',
  CATALOGS: '/catalogs',
  QUOTATIONS: '/quotations'
};

// User Roles
export const USER_ROLES = [
  'Admin',
  'Customer',
  'Staff',
  'Supplier',
  'Manager',
];

// Quotation Statuses
export const QUOTATION_STATUS = [
  'DRAFT',
  'SENT',
  'APPROVED',
  'REJECTED',
  'FINALIZED'
];