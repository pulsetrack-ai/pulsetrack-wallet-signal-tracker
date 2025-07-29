# Helius API Integration

PulseTrack uses Helius API for real-time Solana blockchain data.

## Overview

Helius provides enhanced Solana RPC endpoints and WebSocket connections for real-time transaction monitoring.

### Features Used
- **WebSocket API**: Real-time transaction notifications
- **Enhanced RPC**: Improved transaction parsing
- **Account Monitoring**: Track specific wallet addresses

## Setup

### Getting API Keys
1. Visit [dashboard.helius.dev](https://dashboard.helius.dev)
2. Create an account or sign in
3. Create a new API key
4. Choose appropriate rate limits for your usage

### Configuration
Add your API key to the configuration:
```json
{
  "helius": ["your-helius-api-key"]
}
```

## WebSocket Connection

### Connection Management
```typescript
class HeliusWebSocket {
  private connection: WebSocket;
  private apiKey: string;
  
  connect() {
    const wsUrl = `wss://atlas-mainnet.helius-rpc.com/?api-key=${this.apiKey}`;
    this.connection = new WebSocket(wsUrl);
  }
}
```

### Subscription Format
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "accountSubscribe",
  "params": [
    "wallet-address-here",
    {
      "encoding": "jsonParsed",
      "commitment": "confirmed"
    }
  ]
}
```

## RPC Methods

### Get Transaction History
```typescript
async getTransactionHistory(address: string, limit: number = 100) {
  const response = await fetch(`https://api.helius.xyz/v0/addresses/${address}/transactions`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${this.apiKey}`
    }
  });
  return response.json();
}
```

### Parse Transaction
```typescript
async parseTransaction(signature: string) {
  const response = await fetch(`https://api.helius.xyz/v0/transactions/${signature}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${this.apiKey}`
    }
  });
  return response.json();
}
```

## Rate Limits

### Free Tier
- 100 requests per second
- WebSocket connections: 10 concurrent

### Paid Tiers
- Higher rate limits available
- Multiple API keys for load balancing

## Error Handling

### Common Errors
- **401 Unauthorized**: Invalid API key
- **429 Too Many Requests**: Rate limit exceeded
- **500 Internal Server Error**: Service unavailable

### Retry Logic
```typescript
async function withRetry<T>(fn: () => Promise<T>, maxRetries: number = 3): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
    }
  }
  throw new Error('Max retries exceeded');
}
```

## Load Balancing

### Multiple API Keys
PulseTrack supports multiple API keys for load balancing:
```json
{
  "helius": [
    "api-key-1",
    "api-key-2",
    "api-key-3"
  ]
}
```

### Key Rotation
```typescript
class ApiKeyManager {
  private keys: string[];
  private currentIndex: number = 0;
  
  getNextKey(): string {
    const key = this.keys[this.currentIndex];
    this.currentIndex = (this.currentIndex + 1) % this.keys.length;
    return key;
  }
}
```
