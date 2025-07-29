// PulseTrack Basic Usage Example
// This demonstrates the core functionality of the wallet tracker

class PulseTrackExample {
    constructor() {
        this.isTracking = false;
        this.transactions = [];
        this.websocket = null;
        this.apiKeys = [
            'demo-key-1',
            'demo-key-2',
            'demo-key-3'
        ];
        this.currentKeyIndex = 0;
    }

    /**
     * Start tracking a Solana wallet
     * @param {string} walletAddress - The Solana wallet address to track
     */
    async startTracking(walletAddress) {
        if (!this.validateWalletAddress(walletAddress)) {
            this.showError('Invalid wallet address format');
            return;
        }

        this.isTracking = true;
        this.updateStatus('Connecting to Solana network...');
        
        try {
            await this.connectWebSocket(walletAddress);
            this.updateStatus(`Tracking wallet: ${this.truncateAddress(walletAddress)}`);
        } catch (error) {
            this.showError(`Connection failed: ${error.message}`);
            this.isTracking = false;
        }
    }

    /**
     * Validate Solana wallet address format
     * @param {string} address - The address to validate
     * @returns {boolean} - Whether the address is valid
     */
    validateWalletAddress(address) {
        // Basic Solana address validation (base58, 32-44 characters)
        const solanaAddressRegex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
        return solanaAddressRegex.test(address);
    }

    /**
     * Connect to WebSocket for real-time updates
     * @param {string} walletAddress - The wallet to monitor
     */
    async connectWebSocket(walletAddress) {
        return new Promise((resolve, reject) => {
            // Simulate WebSocket connection for demo
            setTimeout(() => {
                this.simulateTransactions(walletAddress);
                resolve();
            }, 1000);
        });
    }

    /**
     * Simulate real-time transactions for demo purposes
     * @param {string} walletAddress - The wallet being tracked
     */
    simulateTransactions(walletAddress) {
        const transactionTypes = ['Swap', 'Transfer', 'NFT Purchase', 'DeFi Interaction'];
        const tokens = ['SOL', 'USDC', 'RAY', 'SRM', 'ORCA'];
        
        const generateTransaction = () => {
            if (!this.isTracking) return;

            const transaction = {
                id: this.generateTransactionId(),
                type: transactionTypes[Math.floor(Math.random() * transactionTypes.length)],
                token: tokens[Math.floor(Math.random() * tokens.length)],
                amount: (Math.random() * 1000).toFixed(2),
                timestamp: new Date(),
                status: 'Confirmed',
                fee: (Math.random() * 0.01).toFixed(6)
            };

            this.addTransaction(transaction);
            
            // Schedule next transaction (2-8 seconds)
            setTimeout(generateTransaction, 2000 + Math.random() * 6000);
        };

        // Start generating transactions
        generateTransaction();
    }

    /**
     * Add a new transaction to the display
     * @param {Object} transaction - The transaction data
     */
    addTransaction(transaction) {
        this.transactions.unshift(transaction);
        
        // Keep only last 10 transactions
        if (this.transactions.length > 10) {
            this.transactions = this.transactions.slice(0, 10);
        }

        this.updateTransactionDisplay();
    }

    /**
     * Update the transaction display in the UI
     */
    updateTransactionDisplay() {
        const display = document.getElementById('transactionDisplay');
        
        if (this.transactions.length === 0) {
            display.innerHTML = '<div class="status">Waiting for transactions...</div>';
            return;
        }

        const transactionHTML = this.transactions.map(tx => `
            <div class="transaction-item">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <strong>${tx.type}</strong> - ${tx.amount} ${tx.token}
                        <br>
                        <small style="color: #666;">
                            ${tx.timestamp.toLocaleTimeString()} | Fee: ${tx.fee} SOL
                        </small>
                    </div>
                    <div style="color: #28a745; font-weight: bold;">
                        ✓ ${tx.status}
                    </div>
                </div>
            </div>
        `).join('');

        display.innerHTML = `
            <div style="margin-bottom: 15px; font-weight: bold; color: #333;">
                Recent Transactions (${this.transactions.length})
            </div>
            ${transactionHTML}
        `;
    }

    /**
     * Update status message
     * @param {string} message - The status message
     */
    updateStatus(message) {
        const display = document.getElementById('transactionDisplay');
        display.innerHTML = `<div class="status">${message}</div>`;
    }

    /**
     * Show error message
     * @param {string} error - The error message
     */
    showError(error) {
        const display = document.getElementById('transactionDisplay');
        display.innerHTML = `<div class="status" style="color: #dc3545;">❌ ${error}</div>`;
    }

    /**
     * Generate a mock transaction ID
     * @returns {string} - A mock transaction ID
     */
    generateTransactionId() {
        return Array.from({length: 12}, () => 
            Math.floor(Math.random() * 16).toString(16)
        ).join('').toUpperCase();
    }

    /**
     * Truncate wallet address for display
     * @param {string} address - The full address
     * @returns {string} - Truncated address
     */
    truncateAddress(address) {
        if (address.length <= 12) return address;
        return `${address.slice(0, 6)}...${address.slice(-6)}`;
    }

    /**
     * Stop tracking
     */
    stopTracking() {
        this.isTracking = false;
        if (this.websocket) {
            this.websocket.close();
            this.websocket = null;
        }
        this.updateStatus('Tracking stopped');
    }
}

// Initialize the example
const pulseTrack = new PulseTrackExample();

/**
 * Start tracking function called from HTML
 */
function startTracking() {
    const walletInput = document.getElementById('walletAddress');
    const address = walletInput.value.trim();
    
    if (!address) {
        pulseTrack.showError('Please enter a wallet address');
        return;
    }

    const button = document.querySelector('.start-button');
    
    if (pulseTrack.isTracking) {
        pulseTrack.stopTracking();
        button.textContent = 'Start Wallet Tracking';
        button.style.background = 'linear-gradient(45deg, #667eea, #764ba2)';
    } else {
        pulseTrack.startTracking(address);
        button.textContent = 'Stop Tracking';
        button.style.background = 'linear-gradient(45deg, #dc3545, #c82333)';
    }
}

// Add some helpful console information
console.log('🔵 PulseTrack Example Loaded');
console.log('This is a demonstration of PulseTrack\'s core wallet tracking functionality');
console.log('Features demonstrated:');
console.log('- Real-time transaction monitoring');
console.log('- Transaction filtering and display');
console.log('- WebSocket connection simulation');
console.log('- Wallet address validation');
