/**
 * Core Wallet Tracker Class
 * Main entry point for wallet tracking functionality
 */

import { WebSocketBackend } from './services/websocket-backend.js';
import { TransactionFilter } from './filters/transaction-filter.js';
import { TokenDataService } from './services/token-data-service.js';
import { EventEmitter } from './utils/event-emitter.js';
import { Logger } from './utils/logger.js';

export class WalletTracker extends EventEmitter {
    constructor(options = {}) {
        super();
        
        this.options = {
            apiKeys: options.apiKeys || [],
            enableLogging: options.enableLogging || false,
            maxTransactions: options.maxTransactions || 100,
            reconnectAttempts: options.reconnectAttempts || 5,
            ...options
        };

        // Initialize services
        this.websocketBackend = new WebSocketBackend({
            apiKeys: this.options.apiKeys,
            reconnectAttempts: this.options.reconnectAttempts
        });

        this.transactionFilter = new TransactionFilter({
            enableFiltering: this.options.enableFiltering !== false
        });

        this.tokenDataService = new TokenDataService({
            cacheTimeout: this.options.tokenCacheTimeout || 300000 // 5 minutes
        });

        this.logger = new Logger({
            enabled: this.options.enableLogging,
            level: this.options.logLevel || 'info'
        });

        // State
        this.trackedWallets = new Set();
        this.transactions = [];
        this.isConnected = false;

        // Bind event handlers
        this.setupEventHandlers();
    }

    /**
     * Setup event handlers for internal services
     */
    setupEventHandlers() {
        // WebSocket events
        this.websocketBackend.on('connected', () => {
            this.isConnected = true;
            this.logger.info('WebSocket connected');
            this.emit('connected');
        });

        this.websocketBackend.on('disconnected', () => {
            this.isConnected = false;
            this.logger.info('WebSocket disconnected');
            this.emit('disconnected');
        });

        this.websocketBackend.on('transaction', async (transaction) => {
            await this.handleTransaction(transaction);
        });

        this.websocketBackend.on('error', (error) => {
            this.logger.error('WebSocket error:', error);
            this.emit('error', error);
        });
    }

    /**
     * Add a wallet address to track
     * @param {string} walletAddress - Solana wallet address to track
     * @returns {Promise<boolean>} - Success status
     */
    async addWallet(walletAddress) {
        try {
            if (!this.validateWalletAddress(walletAddress)) {
                throw new Error('Invalid wallet address format');
            }

            if (this.trackedWallets.has(walletAddress)) {
                this.logger.warn(`Wallet ${walletAddress} is already being tracked`);
                return true;
            }

            this.trackedWallets.add(walletAddress);
            await this.websocketBackend.subscribeToWallet(walletAddress);
            
            this.logger.info(`Started tracking wallet: ${walletAddress}`);
            this.emit('walletAdded', walletAddress);
            
            return true;
        } catch (error) {
            this.logger.error(`Failed to add wallet ${walletAddress}:`, error);
            this.emit('error', error);
            return false;
        }
    }

    /**
     * Remove a wallet from tracking
     * @param {string} walletAddress - Wallet address to stop tracking
     * @returns {Promise<boolean>} - Success status
     */
    async removeWallet(walletAddress) {
        try {
            if (!this.trackedWallets.has(walletAddress)) {
                this.logger.warn(`Wallet ${walletAddress} is not being tracked`);
                return true;
            }

            this.trackedWallets.delete(walletAddress);
            await this.websocketBackend.unsubscribeFromWallet(walletAddress);
            
            this.logger.info(`Stopped tracking wallet: ${walletAddress}`);
            this.emit('walletRemoved', walletAddress);
            
            return true;
        } catch (error) {
            this.logger.error(`Failed to remove wallet ${walletAddress}:`, error);
            this.emit('error', error);
            return false;
        }
    }

    /**
     * Handle incoming transaction data
     * @param {Object} transaction - Raw transaction data
     */
    async handleTransaction(transaction) {
        try {
            // Apply filters
            if (!this.transactionFilter.shouldInclude(transaction)) {
                this.logger.debug('Transaction filtered out');
                return;
            }

            // Enrich with token data
            const enrichedTransaction = await this.enrichTransaction(transaction);
            
            // Add to transaction history
            this.addTransaction(enrichedTransaction);
            
            // Emit event
            this.emit('transaction', enrichedTransaction);
            
        } catch (error) {
            this.logger.error('Error handling transaction:', error);
            this.emit('error', error);
        }
    }

    /**
     * Enrich transaction with additional token data
     * @param {Object} transaction - Base transaction data
     * @returns {Promise<Object>} - Enriched transaction
     */
    async enrichTransaction(transaction) {
        try {
            const enriched = { ...transaction };
            
            // Fetch token metadata if available
            if (transaction.tokenMint) {
                const tokenData = await this.tokenDataService.getTokenData(transaction.tokenMint);
                if (tokenData) {
                    enriched.tokenData = tokenData;
                    enriched.tokenSymbol = tokenData.symbol;
                    enriched.tokenName = tokenData.name;
                    enriched.tokenLogo = tokenData.logoURI;
                }
            }

            // Add USD value if price data available
            if (enriched.tokenData && enriched.tokenData.priceUsd && transaction.amount) {
                enriched.usdValue = parseFloat(transaction.amount) * enriched.tokenData.priceUsd;
            }

            // Add timestamp if not present
            if (!enriched.timestamp) {
                enriched.timestamp = Date.now();
            }

            return enriched;
        } catch (error) {
            this.logger.warn('Failed to enrich transaction:', error);
            return transaction;
        }
    }

    /**
     * Add transaction to internal storage
     * @param {Object} transaction - Transaction to add
     */
    addTransaction(transaction) {
        this.transactions.unshift(transaction);
        
        // Limit transaction history
        if (this.transactions.length > this.options.maxTransactions) {
            this.transactions = this.transactions.slice(0, this.options.maxTransactions);
        }
    }

    /**
     * Get transaction history
     * @param {Object} options - Filter options
     * @returns {Array} - Filtered transactions
     */
    getTransactions(options = {}) {
        let filtered = this.transactions;

        if (options.walletAddress) {
            filtered = filtered.filter(tx => 
                tx.walletAddress === options.walletAddress
            );
        }

        if (options.tokenMint) {
            filtered = filtered.filter(tx => 
                tx.tokenMint === options.tokenMint
            );
        }

        if (options.limit) {
            filtered = filtered.slice(0, options.limit);
        }

        return filtered;
    }

    /**
     * Validate Solana wallet address
     * @param {string} address - Address to validate
     * @returns {boolean} - Is valid
     */
    validateWalletAddress(address) {
        if (!address || typeof address !== 'string') return false;
        
        // Basic Solana address validation
        const base58Regex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
        return base58Regex.test(address);
    }

    /**
     * Get current tracking status
     * @returns {Object} - Status information
     */
    getStatus() {
        return {
            isConnected: this.isConnected,
            trackedWallets: Array.from(this.trackedWallets),
            transactionCount: this.transactions.length,
            connectionStatus: this.websocketBackend.getStatus()
        };
    }

    /**
     * Start the wallet tracker
     * @returns {Promise<void>}
     */
    async start() {
        try {
            await this.websocketBackend.connect();
            this.logger.info('WalletTracker started');
        } catch (error) {
            this.logger.error('Failed to start WalletTracker:', error);
            throw error;
        }
    }

    /**
     * Stop the wallet tracker
     * @returns {Promise<void>}
     */
    async stop() {
        try {
            await this.websocketBackend.disconnect();
            this.trackedWallets.clear();
            this.logger.info('WalletTracker stopped');
        } catch (error) {
            this.logger.error('Failed to stop WalletTracker:', error);
            throw error;
        }
    }

    /**
     * Clear transaction history
     */
    clearTransactions() {
        this.transactions = [];
        this.emit('transactionsCleared');
    }

    /**
     * Update configuration
     * @param {Object} newOptions - New options to merge
     */
    updateConfig(newOptions) {
        this.options = { ...this.options, ...newOptions };
        
        // Update services with new options
        if (newOptions.apiKeys) {
            this.websocketBackend.updateApiKeys(newOptions.apiKeys);
        }
        
        this.logger.info('Configuration updated');
        this.emit('configUpdated', this.options);
    }
}
