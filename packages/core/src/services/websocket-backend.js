/**
 * WebSocket Backend Service for Real-time Solana Transaction Monitoring
 * Handles connections to Helius WebSocket API with intelligent API key rotation
 */

import { EventEmitter } from '../utils/event-emitter.js';
import { Logger } from '../utils/logger.js';

export class WebSocketBackend extends EventEmitter {
    constructor(options = {}) {
        super();
        
        this.options = {
            apiKeys: options.apiKeys || [],
            reconnectAttempts: options.reconnectAttempts || 5,
            reconnectDelay: options.reconnectDelay || 1000,
            maxReconnectDelay: options.maxReconnectDelay || 30000,
            heartbeatInterval: options.heartbeatInterval || 30000,
            ...options
        };

        // Connection state
        this.websocket = null;
        this.isConnected = false;
        this.isConnecting = false;
        this.reconnectCount = 0;
        this.currentApiKeyIndex = 0;
        
        // Subscription management
        this.subscriptions = new Set();
        this.pendingSubscriptions = new Set();
        
        // API key rotation
        this.lastApiKeyUsage = new Map();
        this.apiKeyFailures = new Map();
        
        // Timers
        this.reconnectTimer = null;
        this.heartbeatTimer = null;
        this.keyRotationTimer = null;
        
        this.logger = new Logger({ prefix: '[WebSocket]' });
        
        this.setupKeyRotation();
    }

    /**
     * Setup automatic API key rotation
     */
    setupKeyRotation() {
        // Rotate API keys every 5 minutes to distribute load
        this.keyRotationTimer = setInterval(() => {
            this.rotateApiKey();
        }, 5 * 60 * 1000);
    }

    /**
     * Get the next available API key
     * @returns {string|null} Next API key or null if none available
     */
    getNextApiKey() {
        if (!this.options.apiKeys || this.options.apiKeys.length === 0) {
            return null;
        }

        const currentTime = Date.now();
        let bestKeyIndex = 0;
        let oldestUsage = currentTime;

        // Find the API key that was used longest ago
        for (let i = 0; i < this.options.apiKeys.length; i++) {
            const lastUsage = this.lastApiKeyUsage.get(i) || 0;
            const failures = this.apiKeyFailures.get(i) || 0;
            
            // Skip keys that have too many recent failures
            if (failures > 3 && (currentTime - lastUsage) < 60000) {
                continue;
            }
            
            if (lastUsage < oldestUsage) {
                oldestUsage = lastUsage;
                bestKeyIndex = i;
            }
        }

        this.currentApiKeyIndex = bestKeyIndex;
        this.lastApiKeyUsage.set(bestKeyIndex, currentTime);
        
        return this.options.apiKeys[bestKeyIndex];
    }

    /**
     * Rotate to next API key
     */
    rotateApiKey() {
        if (this.isConnected) {
            this.logger.info('Rotating API key for load balancing');
            this.reconnect();
        }
    }

    /**
     * Mark API key as failed
     * @param {number} keyIndex - Index of failed API key
     */
    markApiKeyFailed(keyIndex) {
        const currentFailures = this.apiKeyFailures.get(keyIndex) || 0;
        this.apiKeyFailures.set(keyIndex, currentFailures + 1);
        
        // Reset failure count after 10 minutes
        setTimeout(() => {
            this.apiKeyFailures.set(keyIndex, 0);
        }, 10 * 60 * 1000);
    }

    /**
     * Connect to Helius WebSocket
     * @returns {Promise<void>}
     */
    async connect() {
        if (this.isConnected || this.isConnecting) {
            return;
        }

        const apiKey = this.getNextApiKey();
        if (!apiKey) {
            throw new Error('No API keys available for WebSocket connection');
        }

        this.isConnecting = true;
        this.logger.info(`Connecting to Helius WebSocket with API key ${this.currentApiKeyIndex + 1}/${this.options.apiKeys.length}`);

        try {
            const wsUrl = `wss://atlas-mainnet.helius-rpc.com/ws?api-key=${apiKey}`;
            this.websocket = new WebSocket(wsUrl);

            this.websocket.onopen = this.handleOpen.bind(this);
            this.websocket.onmessage = this.handleMessage.bind(this);
            this.websocket.onclose = this.handleClose.bind(this);
            this.websocket.onerror = this.handleError.bind(this);

            // Connection timeout
            const connectTimeout = setTimeout(() => {
                if (this.isConnecting) {
                    this.logger.error('WebSocket connection timeout');
                    this.websocket.close();
                }
            }, 10000);

            await new Promise((resolve, reject) => {
                this.once('connected', () => {
                    clearTimeout(connectTimeout);
                    resolve();
                });
                this.once('error', (error) => {
                    clearTimeout(connectTimeout);
                    reject(error);
                });
            });

        } catch (error) {
            this.isConnecting = false;
            this.markApiKeyFailed(this.currentApiKeyIndex);
            throw error;
        }
    }

    /**
     * Handle WebSocket open event
     */
    handleOpen() {
        this.isConnected = true;
        this.isConnecting = false;
        this.reconnectCount = 0;
        
        this.logger.info('WebSocket connected successfully');
        this.emit('connected');
        
        this.setupHeartbeat();
        this.resubscribeAll();
    }

    /**
     * Handle incoming WebSocket messages
     * @param {MessageEvent} event - WebSocket message event
     */
    handleMessage(event) {
        try {
            const data = JSON.parse(event.data);
            
            if (data.method === 'transactionNotification') {
                this.handleTransactionNotification(data.params);
            } else if (data.method === 'accountNotification') {
                this.handleAccountNotification(data.params);
            } else if (data.id && data.result) {
                this.handleSubscriptionResponse(data);
            } else if (data.error) {
                this.handleRpcError(data.error);
            }
            
        } catch (error) {
            this.logger.error('Error parsing WebSocket message:', error);
        }
    }

    /**
     * Handle transaction notifications
     * @param {Object} params - Transaction notification parameters
     */
    handleTransactionNotification(params) {
        const transaction = this.processTransactionData(params);
        this.emit('transaction', transaction);
    }

    /**
     * Handle account notifications
     * @param {Object} params - Account notification parameters
     */
    handleAccountNotification(params) {
        const accountData = this.processAccountData(params);
        this.emit('accountChange', accountData);
    }

    /**
     * Process raw transaction data from WebSocket
     * @param {Object} rawData - Raw transaction data
     * @returns {Object} Processed transaction
     */
    processTransactionData(rawData) {
        const transaction = {
            signature: rawData.signature,
            slot: rawData.slot,
            timestamp: Date.now(),
            fee: rawData.transaction?.meta?.fee || 0,
            accounts: rawData.transaction?.transaction?.message?.accountKeys || [],
            instructions: rawData.transaction?.transaction?.message?.instructions || [],
            balanceChanges: this.extractBalanceChanges(rawData),
            tokenTransfers: this.extractTokenTransfers(rawData),
            status: rawData.transaction?.meta?.err ? 'failed' : 'success'
        };

        return transaction;
    }

    /**
     * Extract balance changes from transaction data
     * @param {Object} rawData - Raw transaction data
     * @returns {Array} Balance changes
     */
    extractBalanceChanges(rawData) {
        const meta = rawData.transaction?.meta;
        if (!meta || !meta.preBalances || !meta.postBalances) {
            return [];
        }

        const changes = [];
        for (let i = 0; i < meta.preBalances.length; i++) {
            const preBalance = meta.preBalances[i];
            const postBalance = meta.postBalances[i];
            const change = postBalance - preBalance;
            
            if (change !== 0) {
                changes.push({
                    accountIndex: i,
                    account: rawData.transaction?.transaction?.message?.accountKeys[i],
                    change: change,
                    preBalance: preBalance,
                    postBalance: postBalance
                });
            }
        }

        return changes;
    }

    /**
     * Extract token transfers from transaction data
     * @param {Object} rawData - Raw transaction data
     * @returns {Array} Token transfers
     */
    extractTokenTransfers(rawData) {
        const meta = rawData.transaction?.meta;
        if (!meta || !meta.preTokenBalances || !meta.postTokenBalances) {
            return [];
        }

        const transfers = [];
        const preBalances = new Map();
        const postBalances = new Map();

        // Index pre-balances
        meta.preTokenBalances.forEach(balance => {
            const key = `${balance.accountIndex}-${balance.mint}`;
            preBalances.set(key, balance);
        });

        // Index post-balances and find changes
        meta.postTokenBalances.forEach(balance => {
            const key = `${balance.accountIndex}-${balance.mint}`;
            const preBalance = preBalances.get(key);
            
            const preAmount = preBalance ? parseFloat(preBalance.uiTokenAmount.amount) : 0;
            const postAmount = parseFloat(balance.uiTokenAmount.amount);
            const change = postAmount - preAmount;

            if (change !== 0) {
                transfers.push({
                    mint: balance.mint,
                    accountIndex: balance.accountIndex,
                    change: change,
                    decimals: balance.uiTokenAmount.decimals,
                    uiChange: change / Math.pow(10, balance.uiTokenAmount.decimals)
                });
            }
        });

        return transfers;
    }

    /**
     * Subscribe to wallet transactions
     * @param {string} walletAddress - Wallet address to monitor
     * @returns {Promise<boolean>} Success status
     */
    async subscribeToWallet(walletAddress) {
        if (!this.isConnected) {
            this.pendingSubscriptions.add(walletAddress);
            return false;
        }

        const subscriptionMessage = {
            jsonrpc: '2.0',
            id: this.generateId(),
            method: 'transactionSubscribe',
            params: [
                {
                    accountInclude: [walletAddress],
                    accountExclude: [],
                    failed: false
                },
                {
                    commitment: 'confirmed',
                    encoding: 'jsonParsed',
                    transactionDetails: 'full',
                    showRewards: false,
                    maxSupportedTransactionVersion: 0
                }
            ]
        };

        this.sendMessage(subscriptionMessage);
        this.subscriptions.add(walletAddress);
        this.pendingSubscriptions.delete(walletAddress);
        
        this.logger.info(`Subscribed to wallet: ${walletAddress}`);
        return true;
    }

    /**
     * Unsubscribe from wallet transactions
     * @param {string} walletAddress - Wallet address to stop monitoring
     * @returns {Promise<boolean>} Success status
     */
    async unsubscribeFromWallet(walletAddress) {
        // Implementation for unsubscribing
        this.subscriptions.delete(walletAddress);
        this.pendingSubscriptions.delete(walletAddress);
        
        this.logger.info(`Unsubscribed from wallet: ${walletAddress}`);
        return true;
    }

    /**
     * Send message through WebSocket
     * @param {Object} message - Message to send
     */
    sendMessage(message) {
        if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
            this.websocket.send(JSON.stringify(message));
        } else {
            this.logger.warn('Cannot send message: WebSocket not connected');
        }
    }

    /**
     * Setup heartbeat to keep connection alive
     */
    setupHeartbeat() {
        if (this.heartbeatTimer) {
            clearInterval(this.heartbeatTimer);
        }

        this.heartbeatTimer = setInterval(() => {
            if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
                this.websocket.ping();
            }
        }, this.options.heartbeatInterval);
    }

    /**
     * Resubscribe to all active subscriptions
     */
    async resubscribeAll() {
        const allSubscriptions = new Set([...this.subscriptions, ...this.pendingSubscriptions]);
        
        for (const walletAddress of allSubscriptions) {
            await this.subscribeToWallet(walletAddress);
        }
    }

    /**
     * Handle WebSocket close event
     * @param {CloseEvent} event - Close event
     */
    handleClose(event) {
        this.isConnected = false;
        this.isConnecting = false;
        
        if (this.heartbeatTimer) {
            clearInterval(this.heartbeatTimer);
            this.heartbeatTimer = null;
        }

        this.logger.warn(`WebSocket closed: ${event.code} - ${event.reason}`);
        this.emit('disconnected', event);

        // Attempt reconnection if not intentionally closed
        if (event.code !== 1000) {
            this.scheduleReconnect();
        }
    }

    /**
     * Handle WebSocket error event
     * @param {Event} event - Error event
     */
    handleError(event) {
        this.logger.error('WebSocket error:', event);
        this.markApiKeyFailed(this.currentApiKeyIndex);
        this.emit('error', event);
    }

    /**
     * Schedule reconnection attempt
     */
    scheduleReconnect() {
        if (this.reconnectCount >= this.options.reconnectAttempts) {
            this.logger.error('Max reconnection attempts reached');
            this.emit('maxReconnectAttemptsReached');
            return;
        }

        const delay = Math.min(
            this.options.reconnectDelay * Math.pow(2, this.reconnectCount),
            this.options.maxReconnectDelay
        );

        this.logger.info(`Scheduling reconnection attempt ${this.reconnectCount + 1} in ${delay}ms`);

        this.reconnectTimer = setTimeout(() => {
            this.reconnectCount++;
            this.connect().catch(error => {
                this.logger.error('Reconnection failed:', error);
                this.scheduleReconnect();
            });
        }, delay);
    }

    /**
     * Force reconnection
     */
    async reconnect() {
        if (this.websocket) {
            this.websocket.close(1000, 'Manual reconnection');
        }
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        await this.connect();
    }

    /**
     * Disconnect WebSocket
     * @returns {Promise<void>}
     */
    async disconnect() {
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }

        if (this.heartbeatTimer) {
            clearInterval(this.heartbeatTimer);
            this.heartbeatTimer = null;
        }

        if (this.keyRotationTimer) {
            clearInterval(this.keyRotationTimer);
            this.keyRotationTimer = null;
        }

        if (this.websocket) {
            this.websocket.close(1000, 'Manual disconnection');
            this.websocket = null;
        }

        this.isConnected = false;
        this.isConnecting = false;
        this.subscriptions.clear();
        this.pendingSubscriptions.clear();
    }

    /**
     * Generate unique ID for RPC calls
     * @returns {string} Unique ID
     */
    generateId() {
        return Math.random().toString(36).substr(2, 9);
    }

    /**
     * Get connection status
     * @returns {Object} Status information
     */
    getStatus() {
        return {
            isConnected: this.isConnected,
            isConnecting: this.isConnecting,
            reconnectCount: this.reconnectCount,
            currentApiKey: this.currentApiKeyIndex,
            totalApiKeys: this.options.apiKeys.length,
            subscriptions: this.subscriptions.size,
            pendingSubscriptions: this.pendingSubscriptions.size
        };
    }

    /**
     * Update API keys
     * @param {Array<string>} newApiKeys - New API keys
     */
    updateApiKeys(newApiKeys) {
        this.options.apiKeys = newApiKeys;
        this.lastApiKeyUsage.clear();
        this.apiKeyFailures.clear();
        this.currentApiKeyIndex = 0;
        
        this.logger.info(`Updated API keys: ${newApiKeys.length} keys available`);
    }

    /**
     * Handle RPC errors
     * @param {Object} error - RPC error object
     */
    handleRpcError(error) {
        this.logger.error('RPC Error:', error);
        
        if (error.code === -32600 || error.code === -32601) {
            // Invalid request, try with different API key
            this.markApiKeyFailed(this.currentApiKeyIndex);
            this.rotateApiKey();
        }
    }

    /**
     * Handle subscription responses
     * @param {Object} response - Subscription response
     */
    handleSubscriptionResponse(response) {
        if (response.result && typeof response.result === 'number') {
            this.logger.info(`Subscription confirmed with ID: ${response.result}`);
        }
    }
}
