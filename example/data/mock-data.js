// Mock data generation for examples
export function generateMockWalletData() {
    return {
        address: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
        balance: 15.42,
        tokens: [
            { symbol: 'USDC', amount: 1250.50, price: 1.00 },
            { symbol: 'RAY', amount: 85.25, price: 0.75 },
            { symbol: 'SRM', amount: 200.00, price: 0.15 }
        ],
        lastUpdate: Date.now()
    };
}

export function generateMockTransactions(count = 10) {
    const transactionTypes = ['Swap', 'Transfer', 'Mint', 'Burn'];
    const tokens = ['SOL', 'USDC', 'RAY', 'SRM'];
    
    return Array.from({ length: count }, (_, i) => ({
        id: `tx_${i + 1}`,
        type: transactionTypes[Math.floor(Math.random() * transactionTypes.length)],
        amount: (Math.random() * 1000).toFixed(2),
        token: tokens[Math.floor(Math.random() * tokens.length)],
        timestamp: Date.now() - (i * 60000),
        status: 'confirmed'
    }));
}

export function generateMockTokenPrices() {
    return {
        'SOL': { price: 85.42, change24h: 5.2 },
        'USDC': { price: 1.00, change24h: 0.1 },
        'RAY': { price: 0.75, change24h: -2.3 },
        'SRM': { price: 0.15, change24h: 8.7 }
    };
}
