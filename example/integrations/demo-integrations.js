// Integration of different services and validations for demo purposes
import { generateMockWalletData, generateMockTransactions } from '../data/mock-data.js';
import { logInteraction } from '../services/example-service.js';
import { validateSolanaAddress } from '../../packages/core/src/utils/validators.js';

function demoWalletInteraction(walletAddress) {
    if (validateSolanaAddress(walletAddress)) {
        console.log('Valid wallet address:', walletAddress);
        const walletData = generateMockWalletData();
        console.log('Mock wallet data:', walletData);
        logInteraction(walletAddress);
    } else {
        console.error('Invalid wallet address:', walletAddress);
    }
}

function demoTransactionSimulation() {
    const transactions = generateMockTransactions(5);
    console.log('Simulating transactions:', transactions);
    transactions.forEach(tx => {
        console.log(`Transaction ID: ${tx.id}, Type: ${tx.type}, Amount: ${tx.amount}${tx.token}`);
    });
}

export { demoWalletInteraction, demoTransactionSimulation };
