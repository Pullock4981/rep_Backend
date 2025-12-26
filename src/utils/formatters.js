/**
 * Format phone number
 */
exports.formatPhoneNumber = (phone) => {
  if (!phone) return '';
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  // Format as +880XXXXXXXXXX
  if (cleaned.startsWith('880')) {
    return `+${cleaned}`;
  } else if (cleaned.startsWith('0')) {
    return `+880${cleaned.substring(1)}`;
  } else if (cleaned.length === 10) {
    return `+880${cleaned}`;
  }
  return phone;
};

/**
 * Format email
 */
exports.formatEmail = (email) => {
  if (!email) return '';
  return email.toLowerCase().trim();
};

/**
 * Format name (capitalize first letter)
 */
exports.formatName = (name) => {
  if (!name) return '';
  return name
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Format address
 */
exports.formatAddress = (address) => {
  if (!address) return '';
  return address.trim();
};

/**
 * Format number with decimals
 */
exports.formatNumber = (number, decimals = 2) => {
  if (number === null || number === undefined) return '0.00';
  return parseFloat(number).toFixed(decimals);
};

/**
 * Format percentage
 */
exports.formatPercentage = (value, total) => {
  if (!total || total === 0) return '0.00';
  return ((value / total) * 100).toFixed(2);
};

