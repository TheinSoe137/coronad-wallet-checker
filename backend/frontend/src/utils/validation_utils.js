// utils/validation.js

/**
 * Validates if a string is a valid EVM address
 * @param {string} address - The address to validate
 * @returns {boolean} - True if valid, false otherwise
 */
export const validateEVMAddress = (address) => {
    if (!address || typeof address !== 'string') {
        return false;
    }

    // Remove whitespace
    address = address.trim();

    // Check if it starts with 0x
    if (!address.startsWith('0x')) {
        return false;
    }

    // Check if it's exactly 42 characters (0x + 40 hex chars)
    if (address.length !== 42) {
        return false;
    }

    // Check if the remaining characters are valid hex
    const hexPart = address.slice(2);
    const hexRegex = /^[0-9a-fA-F]+$/;
    
    return hexRegex.test(hexPart);
};

/**
 * Normalizes an EVM address to lowercase
 * @param {string} address - The address to normalize
 * @returns {string} - Normalized address
 */
export const normalizeAddress = (address) => {
    if (!address || typeof address !== 'string') {
        return '';
    }
    
    return address.toLowerCase().trim();
};

/**
 * Formats an address for display (truncates middle part)
 * @param {string} address - The address to format
 * @param {number} startChars - Number of characters to show at start (default: 6)
 * @param {number} endChars - Number of characters to show at end (default: 4)
 * @returns {string} - Formatted address
 */
export const formatAddressForDisplay = (address, startChars = 6, endChars = 4) => {
    if (!validateEVMAddress(address)) {
        return address;
    }
    
    if (address.length <= startChars + endChars) {
        return address;
    }
    
    return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
};