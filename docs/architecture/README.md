# Architecture Overview

PulseTrack is built as a modern Chrome extension with real-time capabilities and 3D visualizations.

## Core Components

### Extension Structure
```
pulsetrack-browser-extension/
├── src/
│   ├── background/     # Service worker for background tasks
│   ├── content/        # Content scripts for web page interaction
│   ├── popup/          # Extension popup interface
│   └── sidepanel/      # Main side panel UI
├── packages/
│   ├── core/           # Core wallet tracking logic
│   ├── ui/             # Reusable UI components
│   └── utils/          # Shared utilities
└── docs/               # Documentation
```

### Key Services

#### WalletTracker
- Main orchestrator for wallet monitoring
- Manages WebSocket connections to Solana blockchain
- Coordinates between different services

#### WebSocketBackend
- Real-time connection to Helius WebSocket API
- Handles connection management and reconnection logic
- Processes incoming transaction data

#### TransactionFilter
- Intelligent filtering of blockchain transactions
- Removes noise and focuses on trading-relevant activities
- Configurable filter rules

#### TokenDataService
- Integration with Birdeye API for token metadata
- Caches token information for performance
- Provides price and logo data

### Data Flow
1. **Wallet Registration**: User adds wallet addresses to track
2. **WebSocket Connection**: Establish real-time connection to Solana
3. **Transaction Processing**: Filter and enrich incoming transactions
4. **UI Updates**: Real-time updates to 3D visualization and transaction list
5. **Caching**: Store relevant data for performance optimization

## Technology Stack

### Frontend
- **Three.js**: 3D visualizations and animations
- **React**: UI component framework
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling

### Backend Services
- **Helius API**: Solana RPC and WebSocket services
- **Birdeye API**: Token metadata and pricing
- **Chrome Extension APIs**: Browser integration

### Build Tools
- **Vite**: Fast build tool and dev server
- **ESLint + Prettier**: Code quality and formatting
- **Jest**: Testing framework

## Security Considerations

### Client-Side Processing
- All sensitive operations happen locally in the browser
- No user data is sent to external servers
- API keys are stored securely in Chrome's extension storage

### API Communication
- All external communications use HTTPS/WSS
- API keys are rotated automatically for load balancing
- Rate limiting to prevent API abuse

## Performance Optimizations

### Caching Strategy
- Token metadata cached locally
- Transaction history stored temporarily
- Smart cache invalidation based on data freshness

### Resource Management
- Efficient WebSocket connection pooling
- Memory usage optimization for long-running sessions
- Background processing to avoid blocking UI

### API Efficiency
- Request batching for multiple operations
- Intelligent retry logic with exponential backoff
- Load balancing across multiple API keys
