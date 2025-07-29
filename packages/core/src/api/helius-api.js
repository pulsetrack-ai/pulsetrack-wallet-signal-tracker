// Core API connection methods
import fetch from 'node-fetch';

export function connectToHelius(apiKey) {
    return fetch('https://api.helius.dev/v0/connect', {
        headers: { 'Authorization': `Bearer ${apiKey}` }
    }).then(response => response.json());
}

export async function getWalletTransactions(walletAddress) {
    const response = await fetch(`https://api.helius.dev/v0/wallet/${walletAddress}/transactions`);
    return response.json();
}

export async function getTokenData(mintAddress) {
    const response = await fetch(`https://api.helius.dev/v0/token/${mintAddress}`);
    return response.json();
}

