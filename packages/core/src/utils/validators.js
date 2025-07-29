// Validate user input functions

/**
 * Validate that input is a valid Solana wallet address
 * @param {string} address - Wallet address to validate
 * @returns {boolean} Whether the address is valid
 */
export function validateSolanaAddress(address) {
    const base58Regex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
    return base58Regex.test(address);
}

/**
 * Validate a numeric input
 * @param {any} value - Value to validate
 * @returns {boolean} Whether the value is a valid number
 */
export function validateNumber(value) {
    return typeof value === 'number' && isFinite(value);
}

/**
 * Validate a date input
 * @param {string} date - Date string to validate
 * @returns {boolean} Whether the date is valid
 */
export function validateDate(date) {
    const parsedDate = Date.parse(date);
    return !isNaN(parsedDate);
}

/**
 * Validate a transaction amount
 * @param {string} amount - Amount string to validate
 * @returns {boolean} Whether the amount is a valid number/format
 */
export function validateTransactionAmount(amount) {
    const amountRegex = /^\d+(\.\d{1,2})?$/;
    return amountRegex.test(amount);
}

/**
 * Validate transaction type
 * @param {string} type - Transaction type to validate
 * @returns {boolean} Whether the type is valid
 */
export function validateTransactionType(type) {
    const validTypes = ['transfer', 'swap', 'stake', 'mint'];
    return validTypes.includes(type.toLowerCase());
}

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} Whether the email is valid
 */
export function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Validate JSON structure
 * @param {string} jsonString - JSON string to validate
 * @returns {boolean} Whether JSON is valid
 */
export function validateJSON(jsonString) {
    try {
        JSON.parse(jsonString);
        return true;
    } catch (error) {
        return false;
    }
}

