/**
 * PulseTrack Core Package
 * Main entry point for the core wallet tracking functionality
 */

// Main classes
export { WalletTracker } from './wallet-tracker.js';

// Services
export { WebSocketBackend } from './services/websocket-backend.js';
export { TokenDataService } from './services/token-data-service.js';
export { PortfolioService } from './services/portfolio-service.js';

// Filters
export { TransactionFilter } from './filters/transaction-filter.js';

// API integrations
export { connectToHelius, getWalletTransactions, getTokenData } from './api/helius-api.js';

// Utilities
export { EventEmitter } from './utils/event-emitter.js';
export { Logger } from './utils/logger.js';
export { validateSolanaAddress, validateNumber, validateDate } from './utils/validators.js';
export { shortenAddress, normalizeAddress } from './utils/wallet-address.js';
export { formatTimestamp, getRelativeTime, formatTransactionDate } from './utils/date-formatter.js';
export { formatNumber, formatCurrency, formatLargeNumber, formatPercentage } from './utils/number-formatter.js';

// Styles
export { default as walletStyles } from './styles/wallet-styles.js';

// Version information
export const version = '1.0.0';
export const buildDate = new Date().toISOString();

// Initialize core systems
let isInitialized = false;

/**
 * Initialize the PulseTrack core system
 * @param {Object} options - Initialization options
 * @returns {Promise<void>}
 */
export async function initialize(options = {}) {
    if (isInitialized) {
        console.warn('PulseTrack core is already initialized');
        return;
    }

    try {
        console.info('Initializing PulseTrack Core v' + version);
        
        // Validate required options
        if (!options.apiKeys || !options.apiKeys.helius) {
            throw new Error('Helius API keys are required for initialization');
        }

        // Set up global error handling
        if (typeof window !== 'undefined') {
            window.addEventListener('unhandledrejection', (event) => {
                console.error('Unhandled promise rejection in PulseTrack:', event.reason);
            });
        }

        isInitialized = true;
        console.info('PulseTrack Core initialized successfully');
        
    } catch (error) {
        console.error('Failed to initialize PulseTrack Core:', error);
        throw error;
    }
}

/**
 * Get initialization status
 * @returns {boolean} Whether core is initialized
 */
export function isInitialized() {
    return isInitialized;
}

/**
 * Shutdown the core system
 * @returns {Promise<void>}
 */
export async function shutdown() {
    if (!isInitialized) {
        return;
    }

    try {
        console.info('Shutting down PulseTrack Core');
        
        // Clean up resources here
        isInitialized = false;
        
        console.info('PulseTrack Core shutdown complete');
    } catch (error) {
        console.error('Error during PulseTrack Core shutdown:', error);
        throw error;
    }
}
