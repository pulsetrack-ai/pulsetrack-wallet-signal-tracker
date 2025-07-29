// Configuration for example demonstrations
export const exampleConfig = {
    // API endpoints for demo
    api: {
        helius: 'https://api.helius.dev/v0',
        birdeye: 'https://public-api.birdeye.so',
        solscan: 'https://api.solscan.io'
    },
    
    // Demo wallet addresses
    wallets: [
        '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
        'DfXygSm4jCyNCybVYYK6DwvWqjKee8pbDmJGcLWNDXjh',
        '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM'
    ],
    
    // UI settings
    ui: {
        theme: 'dark',
        animationSpeed: 'normal',
        showTooltips: true,
        enableSound: false
    },
    
    // Demo data settings
    demo: {
        transactionCount: 50,
        refreshInterval: 5000,
        enableMockData: true,
        simulateLatency: 1000
    },
    
    // Visual settings
    visual: {
        showGrid: true,
        showAxes: false,
        particleCount: 100,
        backgroundOpacity: 0.8
    }
};

export function getConfig(key) {
    return key ? exampleConfig[key] : exampleConfig;
}

export function updateConfig(key, value) {
    if (exampleConfig[key]) {
        exampleConfig[key] = { ...exampleConfig[key], ...value };
    }
}
