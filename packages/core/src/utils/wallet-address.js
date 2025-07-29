/**
 * Wallet Address Utility
 * Handles common functions for wallet address management
 */

import { validateSolanaAddress } from '../utils/validators.js';

/**
 * Shorten a Solana wallet address for display
 * @param {string} address - Full wallet address
 * @returns {string} Shortened address
 */
export function shortenAddress(address) {
    if (!validateSolanaAddress(address)) {
        throw new Error('Invalid Solana address');
    }
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
}

/**
 * Group wallet addresses by owner
 * @param {Array<string>} addresses - Array of addresses
 * @returns {Object} Grouped addresses
 */
export function groupAddressesByOwner(addresses) {
    // Mock implementation for grouping
    return addresses.reduce((grouped, address) => {
        const owner = address.slice(0, 1);
        if (!grouped[owner]) {
            grouped[owner] = [];
        }
        grouped[owner].push(address);
        return grouped;
    }, {});
}

/**
 * Normalize wallet address to a standard format
 * @param {string} address - Wallet address to normalize
 * @returns {string} Normalized address
 */
export function normalizeAddress(address) {
    if (!validateSolanaAddress(address)) {
        throw new Error('Invalid Solana address');
    }
    return address.trim();
}
