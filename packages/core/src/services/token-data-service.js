/**
 * Token Data Service
 * Handles token metadata and pricing information from Birdeye API
 */

import { Logger } from '../utils/logger.js';

export class TokenDataService {
    constructor(options = {}) {
        this.options = {
            cacheTimeout: options.cacheTimeout || 300000, // 5 minutes
            birdeyeApiKey: options.birdeyeApiKey || null,
            maxRetries: options.maxRetries || 3,
            retryDelay: options.retryDelay || 1000,
            ...options
        };

        // Token data cache
        this.cache = new Map();
        this.priceCache = new Map();
        this.logoCache = new Map();
        
        // Request queues for batching
        this.pendingRequests = new Map();
        this.batchQueue = new Set();
        this.batchTimer = null;
        
        this.logger = new Logger({ prefix: '[TokenData]' });
        
        // Setup cache cleanup
        this.setupCacheCleanup();
    }

    /**
     * Setup automatic cache cleanup
     */
    setupCacheCleanup() {
        setInterval(() => {
            this.cleanupExpiredCache();
        }, 60000); // Cleanup every minute
    }

    /**
     * Get token data with caching
     * @param {string} tokenMint - Token mint address
     * @returns {Promise<Object|null>} Token data or null
     */
    async getTokenData(tokenMint) {
        if (!tokenMint) {
            return null;
        }

        // Check cache first
        const cached = this.getCachedToken(tokenMint);
        if (cached) {
            return cached;
        }

        // Check if request is already pending
        if (this.pendingRequests.has(tokenMint)) {
            return await this.pendingRequests.get(tokenMint);
        }

        // Create new request
        const promise = this.fetchTokenData(tokenMint);
        this.pendingRequests.set(tokenMint, promise);

        try {
            const result = await promise;
            this.cacheTokenData(tokenMint, result);
            return result;
        } catch (error) {
            this.logger.error(`Failed to fetch token data for ${tokenMint}:`, error);
            return null;
        } finally {
            this.pendingRequests.delete(tokenMint);
        }
    }

    /**
     * Fetch token data from Birdeye API
     * @param {string} tokenMint - Token mint address
     * @returns {Promise<Object>} Token data
     */
    async fetchTokenData(tokenMint) {
        const url = `https://public-api.birdeye.so/defi/token_overview?address=${tokenMint}`;
        
        const headers = {
            'X-API-KEY': this.options.birdeyeApiKey,
            'Content-Type': 'application/json'
        };

        let lastError;
        
        for (let attempt = 0; attempt < this.options.maxRetries; attempt++) {
            try {
                const response = await fetch(url, { headers });
                
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                const data = await response.json();
                
                if (data.success && data.data) {
                    return this.processTokenData(data.data);
                } else {
                    throw new Error('Invalid API response format');
                }
                
            } catch (error) {
                lastError = error;
                this.logger.warn(`Token data fetch attempt ${attempt + 1} failed:`, error.message);
                
                if (attempt < this.options.maxRetries - 1) {
                    await this.delay(this.options.retryDelay * Math.pow(2, attempt));
                }
            }
        }

        throw lastError;
    }

    /**
     * Process raw token data from API
     * @param {Object} rawData - Raw token data from API
     * @returns {Object} Processed token data
     */
    processTokenData(rawData) {
        return {
            address: rawData.address,
            symbol: rawData.symbol || 'UNKNOWN',
            name: rawData.name || 'Unknown Token',
            decimals: rawData.decimals || 9,
            logoURI: rawData.logo_uri || null,
            price: rawData.price || 0,
            priceUsd: rawData.price || 0,
            priceChange24h: rawData.price_change_24h || 0,
            volume24h: rawData.volume_24h || 0,
            marketCap: rawData.market_cap || 0,
            supply: rawData.total_supply || 0,
            circulatingSupply: rawData.circulating_supply || 0,
            liquidity: rawData.liquidity || 0,
            lastUpdated: Date.now(),
            extensions: {
                website: rawData.website || null,
                twitter: rawData.twitter || null,
                telegram: rawData.telegram || null,
                discord: rawData.discord || null
            }
        };
    }

    /**
     * Get multiple token data in batch
     * @param {string[]} tokenMints - Array of token mint addresses
     * @returns {Promise<Map>} Map of token mint to token data
     */
    async getBatchTokenData(tokenMints) {
        const results = new Map();
        const toFetch = [];

        // Check cache for each token
        for (const mint of tokenMints) {
            const cached = this.getCachedToken(mint);
            if (cached) {
                results.set(mint, cached);
            } else {
                toFetch.push(mint);
            }
        }

        // Fetch uncached tokens
        if (toFetch.length > 0) {
            const batchResults = await this.fetchBatchTokenData(toFetch);
            
            for (const [mint, data] of batchResults) {
                results.set(mint, data);
                this.cacheTokenData(mint, data);
            }
        }

        return results;
    }

    /**
     * Fetch multiple tokens in a single batch request
     * @param {string[]} tokenMints - Array of token mint addresses
     * @returns {Promise<Map>} Map of results
     */
    async fetchBatchTokenData(tokenMints) {
        const results = new Map();
        
        // Birdeye API might not support batch requests, so we'll use Promise.all
        const promises = tokenMints.map(async (mint) => {
            try {
                const data = await this.fetchTokenData(mint);
                return [mint, data];
            } catch (error) {
                this.logger.warn(`Batch fetch failed for ${mint}:`, error.message);
                return [mint, null];
            }
        });

        const batchResults = await Promise.allSettled(promises);
        
        batchResults.forEach((result) => {
            if (result.status === 'fulfilled' && result.value) {
                const [mint, data] = result.value;
                if (data) {
                    results.set(mint, data);
                }
            }
        });

        return results;
    }

    /**
     * Get token price only
     * @param {string} tokenMint - Token mint address
     * @returns {Promise<number|null>} Token price or null
     */
    async getTokenPrice(tokenMint) {
        // Check price cache first
        const cachedPrice = this.getCachedPrice(tokenMint);
        if (cachedPrice !== null) {
            return cachedPrice;
        }

        try {
            const tokenData = await this.getTokenData(tokenMint);
            return tokenData ? tokenData.priceUsd : null;
        } catch (error) {
            this.logger.error(`Failed to get price for ${tokenMint}:`, error);
            return null;
        }
    }

    /**
     * Get token logo URL
     * @param {string} tokenMint - Token mint address
     * @returns {Promise<string|null>} Logo URL or null
     */
    async getTokenLogo(tokenMint) {
        // Check logo cache first
        const cachedLogo = this.getCachedLogo(tokenMint);
        if (cachedLogo) {
            return cachedLogo;
        }

        try {
            const tokenData = await this.getTokenData(tokenMint);
            const logoURI = tokenData ? tokenData.logoURI : null;
            
            if (logoURI) {
                this.cacheTokenLogo(tokenMint, logoURI);
            }
            
            return logoURI;
        } catch (error) {
            this.logger.error(`Failed to get logo for ${tokenMint}:`, error);
            return null;
        }
    }

    /**
     * Get cached token data
     * @param {string} tokenMint - Token mint address
     * @returns {Object|null} Cached token data or null
     */
    getCachedToken(tokenMint) {
        const cached = this.cache.get(tokenMint);
        
        if (!cached) {
            return null;
        }

        // Check if cache is expired
        if (Date.now() - cached.timestamp > this.options.cacheTimeout) {
            this.cache.delete(tokenMint);
            return null;
        }

        return cached.data;
    }

    /**
     * Get cached price
     * @param {string} tokenMint - Token mint address
     * @returns {number|null} Cached price or null
     */
    getCachedPrice(tokenMint) {
        const cached = this.priceCache.get(tokenMint);
        
        if (!cached) {
            return null;
        }

        // Price cache expires faster (1 minute)
        if (Date.now() - cached.timestamp > 60000) {
            this.priceCache.delete(tokenMint);
            return null;
        }

        return cached.price;
    }

    /**
     * Get cached logo URL
     * @param {string} tokenMint - Token mint address
     * @returns {string|null} Cached logo URL or null
     */
    getCachedLogo(tokenMint) {
        const cached = this.logoCache.get(tokenMint);
        
        if (!cached) {
            return null;
        }

        // Logo cache lasts longer (1 hour)
        if (Date.now() - cached.timestamp > 3600000) {
            this.logoCache.delete(tokenMint);
            return null;
        }

        return cached.logoURI;
    }

    /**
     * Cache token data
     * @param {string} tokenMint - Token mint address
     * @param {Object} data - Token data to cache
     */
    cacheTokenData(tokenMint, data) {
        if (!data) return;

        this.cache.set(tokenMint, {
            data: data,
            timestamp: Date.now()
        });

        // Also cache price and logo separately for faster access
        if (data.priceUsd !== undefined) {
            this.priceCache.set(tokenMint, {
                price: data.priceUsd,
                timestamp: Date.now()
            });
        }

        if (data.logoURI) {
            this.logoCache.set(tokenMint, {
                logoURI: data.logoURI,
                timestamp: Date.now()
            });
        }
    }

    /**
     * Cache token logo
     * @param {string} tokenMint - Token mint address
     * @param {string} logoURI - Logo URI to cache
     */
    cacheTokenLogo(tokenMint, logoURI) {
        this.logoCache.set(tokenMint, {
            logoURI: logoURI,
            timestamp: Date.now()
        });
    }

    /**
     * Clean up expired cache entries
     */
    cleanupExpiredCache() {
        const now = Date.now();
        
        // Clean main cache
        for (const [key, value] of this.cache.entries()) {
            if (now - value.timestamp > this.options.cacheTimeout) {
                this.cache.delete(key);
            }
        }

        // Clean price cache
        for (const [key, value] of this.priceCache.entries()) {
            if (now - value.timestamp > 60000) {
                this.priceCache.delete(key);
            }
        }

        // Clean logo cache
        for (const [key, value] of this.logoCache.entries()) {
            if (now - value.timestamp > 3600000) {
                this.logoCache.delete(key);
            }
        }

        this.logger.info(`Cache cleanup completed. Main: ${this.cache.size}, Price: ${this.priceCache.size}, Logo: ${this.logoCache.size}`);
    }

    /**
     * Clear all caches
     */
    clearCache() {
        this.cache.clear();
        this.priceCache.clear();
        this.logoCache.clear();
        this.logger.info('All caches cleared');
    }

    /**
     * Get cache statistics
     * @returns {Object} Cache statistics
     */
    getCacheStats() {
        return {
            mainCache: {
                size: this.cache.size,
                timeout: this.options.cacheTimeout
            },
            priceCache: {
                size: this.priceCache.size,
                timeout: 60000
            },
            logoCache: {
                size: this.logoCache.size,
                timeout: 3600000
            },
            pendingRequests: this.pendingRequests.size
        };
    }

    /**
     * Utility delay function
     * @param {number} ms - Milliseconds to delay
     * @returns {Promise} Promise that resolves after delay
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Update API key
     * @param {string} apiKey - New Birdeye API key
     */
    updateApiKey(apiKey) {
        this.options.birdeyeApiKey = apiKey;
        this.logger.info('Birdeye API key updated');
    }
}
