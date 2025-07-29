/**
 * Transaction Filter Service
 * Filters transactions to show only trading-relevant data
 */

import { Logger } from '../utils/logger.js';

export class TransactionFilter {
    constructor(options = {}) {
        this.options = {
            enableFiltering: options.enableFiltering !== false,
            minAmount: options.minAmount || 0.001,
            maxAge: options.maxAge || 86400000, // 24 hours
            ...options
        };

        // Filter rules
        this.blacklistAddresses = new Set([
            // Common system programs to filter out
            '11111111111111111111111111111112', // System Program
            'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA', // Token Program
            'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL', // Associated Token Program
        ]);

        this.whitelistPrograms = new Set([
            // DEX programs to include
            '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM', // Serum DEX
            'JUP4Fb2cqiRUcaTHdrPC8h2gNsA2ETXiPDD33WcGuJB',  // Jupiter
            'whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc',  // Whirlpool
        ]);

        this.logger = new Logger({ prefix: '[Filter]' });
    }

    /**
     * Check if transaction should be included
     * @param {Object} transaction - Transaction to filter
     * @returns {boolean} Should include transaction
     */
    shouldInclude(transaction) {
        if (!this.options.enableFiltering) {
            return true;
        }

        // Filter by age
        if (!this.passesAgeFilter(transaction)) {
            return false;
        }

        // Filter by amount
        if (!this.passesAmountFilter(transaction)) {
            return false;
        }

        // Filter by program
        if (!this.passesProgramFilter(transaction)) {
            return false;
        }

        // Filter by address blacklist
        if (!this.passesAddressFilter(transaction)) {
            return false;
        }

        // Filter by transaction type
        if (!this.passesTypeFilter(transaction)) {
            return false;
        }

        return true;
    }

    /**
     * Check if transaction passes age filter
     * @param {Object} transaction - Transaction to check
     * @returns {boolean} Passes filter
     */
    passesAgeFilter(transaction) {
        if (!transaction.timestamp) {
            return true;
        }

        const age = Date.now() - transaction.timestamp;
        return age <= this.options.maxAge;
    }

    /**
     * Check if transaction passes amount filter
     * @param {Object} transaction - Transaction to check
     * @returns {boolean} Passes filter
     */
    passesAmountFilter(transaction) {
        // Check token transfers for significant amounts
        if (transaction.tokenTransfers && transaction.tokenTransfers.length > 0) {
            return transaction.tokenTransfers.some(transfer => 
                Math.abs(transfer.uiChange) >= this.options.minAmount
            );
        }

        // Check SOL balance changes
        if (transaction.balanceChanges && transaction.balanceChanges.length > 0) {
            const solChange = transaction.balanceChanges.reduce((total, change) => 
                total + Math.abs(change.change), 0
            );
            return (solChange / 1e9) >= this.options.minAmount; // Convert lamports to SOL
        }

        return true; // Include if no amount data
    }

    /**
     * Check if transaction passes program filter
     * @param {Object} transaction - Transaction to check
     * @returns {boolean} Passes filter
     */
    passesProgramFilter(transaction) {
        if (!transaction.instructions || transaction.instructions.length === 0) {
            return true;
        }

        // Include if any instruction is from a whitelisted program
        return transaction.instructions.some(instruction => 
            this.whitelistPrograms.has(instruction.programId)
        );
    }

    /**
     * Check if transaction passes address blacklist filter
     * @param {Object} transaction - Transaction to check
     * @returns {boolean} Passes filter
     */
    passesAddressFilter(transaction) {
        if (!transaction.accounts || transaction.accounts.length === 0) {
            return true;
        }

        // Exclude if only blacklisted addresses are involved
        const nonBlacklistedAccounts = transaction.accounts.filter(account => 
            !this.blacklistAddresses.has(account)
        );

        return nonBlacklistedAccounts.length > 0;
    }

    /**
     * Check if transaction passes type filter
     * @param {Object} transaction - Transaction to check
     * @returns {boolean} Passes filter
     */
    passesTypeFilter(transaction) {
        // Include successful transactions
        if (transaction.status !== 'success') {
            return false;
        }

        // Must have either token transfers or significant SOL changes
        const hasTokenTransfers = transaction.tokenTransfers && transaction.tokenTransfers.length > 0;
        const hasBalanceChanges = transaction.balanceChanges && transaction.balanceChanges.length > 0;

        return hasTokenTransfers || hasBalanceChanges;
    }

    /**
     * Add address to blacklist
     * @param {string} address - Address to blacklist
     */
    addToBlacklist(address) {
        this.blacklistAddresses.add(address);
        this.logger.info(`Added ${address} to blacklist`);
    }

    /**
     * Remove address from blacklist
     * @param {string} address - Address to remove
     */
    removeFromBlacklist(address) {
        this.blacklistAddresses.delete(address);
        this.logger.info(`Removed ${address} from blacklist`);
    }

    /**
     * Add program to whitelist
     * @param {string} programId - Program ID to whitelist
     */
    addToWhitelist(programId) {
        this.whitelistPrograms.add(programId);
        this.logger.info(`Added ${programId} to whitelist`);
    }

    /**
     * Remove program from whitelist
     * @param {string} programId - Program ID to remove
     */
    removeFromWhitelist(programId) {
        this.whitelistPrograms.delete(programId);
        this.logger.info(`Removed ${programId} from whitelist`);
    }

    /**
     * Get filter statistics
     * @returns {Object} Filter statistics
     */
    getFilterStats() {
        return {
            enabled: this.options.enableFiltering,
            blacklistSize: this.blacklistAddresses.size,
            whitelistSize: this.whitelistPrograms.size,
            minAmount: this.options.minAmount,
            maxAge: this.options.maxAge
        };
    }

    /**
     * Update filter options
     * @param {Object} newOptions - New filter options
     */
    updateOptions(newOptions) {
        this.options = { ...this.options, ...newOptions };
        this.logger.info('Filter options updated', this.options);
    }
}
