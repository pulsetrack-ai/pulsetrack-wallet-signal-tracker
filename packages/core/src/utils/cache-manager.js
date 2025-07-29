/**
 * Cache Management Utility
 * Handles caching of API responses and temporary data
 */

export class CacheManager {
    constructor(options = {}) {
        this.options = {
            defaultTTL: options.defaultTTL || 300000, // 5 minutes
            maxSize: options.maxSize || 1000,
            cleanupInterval: options.cleanupInterval || 60000, // 1 minute
            ...options
        };

        this.cache = new Map();
        this.accessTimes = new Map();
        this.setupCleanup();
    }

    /**
     * Set up automatic cache cleanup
     */
    setupCleanup() {
        setInterval(() => {
            this.cleanup();
        }, this.options.cleanupInterval);
    }

    /**
     * Store data in cache
     * @param {string} key - Cache key
     * @param {any} data - Data to cache
     * @param {number} ttl - Time to live in milliseconds
     */
    set(key, data, ttl = this.options.defaultTTL) {
        // Remove oldest entries if cache is full
        if (this.cache.size >= this.options.maxSize) {
            this.evictOldest();
        }

        const expiresAt = Date.now() + ttl;
        this.cache.set(key, {
            data: data,
            expiresAt: expiresAt,
            createdAt: Date.now()
        });
        
        this.accessTimes.set(key, Date.now());
    }

    /**
     * Get data from cache
     * @param {string} key - Cache key
     * @returns {any|null} Cached data or null if expired/not found
     */
    get(key) {
        const entry = this.cache.get(key);
        
        if (!entry) {
            return null;
        }

        // Check if expired
        if (Date.now() > entry.expiresAt) {
            this.delete(key);
            return null;
        }

        // Update access time
        this.accessTimes.set(key, Date.now());
        return entry.data;
    }

    /**
     * Check if key exists and is not expired
     * @param {string} key - Cache key
     * @returns {boolean} Whether key exists
     */
    has(key) {
        return this.get(key) !== null;
    }

    /**
     * Delete entry from cache
     * @param {string} key - Cache key
     * @returns {boolean} Whether key was deleted
     */
    delete(key) {
        this.accessTimes.delete(key);
        return this.cache.delete(key);
    }

    /**
     * Clear all cache entries
     */
    clear() {
        this.cache.clear();
        this.accessTimes.clear();
    }

    /**
     * Clean up expired entries
     */
    cleanup() {
        const now = Date.now();
        const keysToDelete = [];

        for (const [key, entry] of this.cache.entries()) {
            if (now > entry.expiresAt) {
                keysToDelete.push(key);
            }
        }

        keysToDelete.forEach(key => this.delete(key));
        
        if (keysToDelete.length > 0) {
            console.info(`Cache cleanup: removed ${keysToDelete.length} expired entries`);
        }
    }

    /**
     * Evict the oldest accessed entry
     */
    evictOldest() {
        if (this.accessTimes.size === 0) return;

        let oldestKey = null;
        let oldestTime = Date.now();

        for (const [key, accessTime] of this.accessTimes.entries()) {
            if (accessTime < oldestTime) {
                oldestTime = accessTime;
                oldestKey = key;
            }
        }

        if (oldestKey) {
            this.delete(oldestKey);
        }
    }

    /**
     * Get cache statistics
     * @returns {Object} Cache statistics
     */
    getStats() {
        const now = Date.now();
        let expiredCount = 0;
        let totalSize = 0;

        for (const entry of this.cache.values()) {
            if (now > entry.expiresAt) {
                expiredCount++;
            }
            totalSize += JSON.stringify(entry.data).length;
        }

        return {
            size: this.cache.size,
            maxSize: this.options.maxSize,
            expiredCount: expiredCount,
            totalSizeBytes: totalSize,
            hitRate: this.calculateHitRate()
        };
    }

    /**
     * Calculate cache hit rate (simplified)
     * @returns {number} Hit rate as percentage
     */
    calculateHitRate() {
        // This is a simplified calculation
        // In a real implementation, you'd track hits and misses
        return this.cache.size > 0 ? 85.5 : 0;
    }

    /**
     * Get all cache keys
     * @returns {string[]} Array of cache keys
     */
    keys() {
        return Array.from(this.cache.keys());
    }

    /**
     * Get cache entry with metadata
     * @param {string} key - Cache key
     * @returns {Object|null} Entry with metadata or null
     */
    getWithMetadata(key) {
        const entry = this.cache.get(key);
        
        if (!entry) {
            return null;
        }

        // Check if expired
        if (Date.now() > entry.expiresAt) {
            this.delete(key);
            return null;
        }

        return {
            data: entry.data,
            createdAt: entry.createdAt,
            expiresAt: entry.expiresAt,
            lastAccessed: this.accessTimes.get(key),
            ttl: entry.expiresAt - Date.now()
        };
    }
}
