/**
 * Number formatting utilities for displaying amounts and prices
 */

/**
 * Format number with proper decimal places
 * @param {number} num - Number to format
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted number
 */
export function formatNumber(num, decimals = 2) {
    if (typeof num !== 'number' || isNaN(num)) {
        return '0';
    }
    return num.toLocaleString(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: decimals
    });
}

/**
 * Format currency amount with USD symbol
 * @param {number} amount - Amount to format
 * @returns {string} Formatted currency
 */
export function formatCurrency(amount) {
    if (typeof amount !== 'number' || isNaN(amount)) {
        return '$0.00';
    }
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

/**
 * Format large numbers with K, M, B suffixes
 * @param {number} num - Number to format
 * @returns {string} Formatted number with suffix
 */
export function formatLargeNumber(num) {
    if (typeof num !== 'number' || isNaN(num)) {
        return '0';
    }
    
    const absNum = Math.abs(num);
    const sign = num < 0 ? '-' : '';
    
    if (absNum >= 1e9) {
        return sign + (absNum / 1e9).toFixed(1) + 'B';
    } else if (absNum >= 1e6) {
        return sign + (absNum / 1e6).toFixed(1) + 'M';
    } else if (absNum >= 1e3) {
        return sign + (absNum / 1e3).toFixed(1) + 'K';
    } else {
        return sign + absNum.toFixed(2);
    }
}

/**
 * Format percentage with proper sign and color indication
 * @param {number} percent - Percentage to format
 * @returns {Object} Formatted percentage with color class
 */
export function formatPercentage(percent) {
    if (typeof percent !== 'number' || isNaN(percent)) {
        return { text: '0.00%', colorClass: 'neutral' };
    }
    
    const formatted = Math.abs(percent).toFixed(2) + '%';
    const sign = percent > 0 ? '+' : percent < 0 ? '-' : '';
    const colorClass = percent > 0 ? 'positive' : percent < 0 ? 'negative' : 'neutral';
    
    return {
        text: sign + formatted,
        colorClass: colorClass
    };
}

/**
 * Format SOL amount with proper decimal places
 * @param {number} lamports - Amount in lamports
 * @returns {string} Formatted SOL amount
 */
export function formatSOL(lamports) {
    if (typeof lamports !== 'number' || isNaN(lamports)) {
        return '0 SOL';
    }
    const sol = lamports / 1e9;
    return formatNumber(sol, 4) + ' SOL';
}

/**
 * Format token amount with symbol
 * @param {number} amount - Token amount
 * @param {string} symbol - Token symbol
 * @param {number} decimals - Token decimals
 * @returns {string} Formatted token amount
 */
export function formatTokenAmount(amount, symbol = 'TOKEN', decimals = 2) {
    if (typeof amount !== 'number' || isNaN(amount)) {
        return `0 ${symbol}`;
    }
    return formatNumber(amount, decimals) + ` ${symbol}`;
}

/**
 * Format market cap with appropriate suffix
 * @param {number} marketCap - Market cap value
 * @returns {string} Formatted market cap
 */
export function formatMarketCap(marketCap) {
    const formatted = formatLargeNumber(marketCap);
    return `$${formatted}`;
}

/**
 * Format volume with appropriate suffix
 * @param {number} volume - Volume value
 * @returns {string} Formatted volume
 */
export function formatVolume(volume) {
    const formatted = formatLargeNumber(volume);
    return `$${formatted}`;
}

/**
 * Round number to specific precision
 * @param {number} num - Number to round
 * @param {number} precision - Decimal precision
 * @returns {number} Rounded number
 */
export function roundToPrecision(num, precision = 2) {
    if (typeof num !== 'number' || isNaN(num)) {
        return 0;
    }
    const factor = Math.pow(10, precision);
    return Math.round(num * factor) / factor;
}
