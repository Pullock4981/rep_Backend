/**
 * Generate unique order number
 */
exports.generateOrderNumber = (prefix = 'ORD') => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
};

/**
 * Generate unique invoice number
 */
exports.generateInvoiceNumber = (prefix = 'INV') => {
  const year = new Date().getFullYear();
  const month = String(new Date().getMonth() + 1).padStart(2, '0');
  const timestamp = Date.now().toString(36).toUpperCase().slice(-6);
  return `${prefix}-${year}${month}-${timestamp}`;
};

/**
 * Generate unique SKU
 */
exports.generateSKU = (prefix = 'SKU', length = 8) => {
  const random = Math.random().toString(36).substring(2, 2 + length).toUpperCase();
  return `${prefix}-${random}`;
};

/**
 * Generate unique transaction ID
 */
exports.generateTransactionId = (prefix = 'TXN') => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
};

/**
 * Generate purchase order number
 */
exports.generatePONumber = (prefix = 'PO') => {
  const year = new Date().getFullYear();
  const month = String(new Date().getMonth() + 1).padStart(2, '0');
  const timestamp = Date.now().toString(36).toUpperCase().slice(-6);
  return `${prefix}-${year}${month}-${timestamp}`;
};

