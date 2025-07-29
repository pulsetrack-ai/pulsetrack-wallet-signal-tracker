# API Documentation

This section contains detailed documentation for all APIs used and exposed by PulseTrack.

## Table of Contents

- [Helius API Integration](./helius-api.md)
- [Birdeye API Integration](./birdeye-api.md)
- [WebSocket API](./websocket-api.md)
- [Extension APIs](./extension-apis.md)
- [Token Data API](./token-data-api.md)

## Overview

PulseTrack integrates with multiple external APIs to provide comprehensive Solana wallet tracking:

### External APIs
- **Helius API**: Real-time transaction monitoring via WebSocket
- **Birdeye API**: Token metadata, pricing, and market data

### Internal APIs
- **WebSocket Backend**: Real-time transaction processing
- **Transaction Filters**: Smart transaction filtering system
- **Navigation System**: UI state management

## Authentication

All external API calls require proper authentication:

```javascript
// Example API key usage
const headers = {
  'Authorization': `Bearer ${API_KEY}`,
  'Content-Type': 'application/json'
};
```

## Rate Limiting

PulseTrack implements intelligent rate limiting and API key rotation to ensure reliable service:

- Helius: Multiple API keys with automatic rotation
- Birdeye: Cached responses to minimize API calls
- WebSocket: Connection pooling and reconnection logic

## Error Handling

All API integrations include comprehensive error handling:

```javascript
try {
  const response = await fetch(apiEndpoint, options);
  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }
  return await response.json();
} catch (error) {
  console.error('API call failed:', error);
  // Fallback logic here
}
```
