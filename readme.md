# 🔵 PulseTrack - Real-time Solana Wallet Tracker

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-blue)](https://developer.chrome.com/docs/extensions/)
[![Solana](https://img.shields.io/badge/Solana-Blockchain-purple)](https://solana.com/)

PulseTrack is a sophisticated browser extension that provides real-time tracking of Solana blockchain wallets with immersive 3D visualizations powered by Three.js. Monitor transactions, analyze trading patterns, and stay updated with live blockchain data directly in your browser.

## ✨ Features

### 🔄 Real-time Monitoring
- **Live Transaction Tracking**: Monitor Solana wallets in real-time via WebSocket connections
- **Instant Notifications**: Get immediate alerts for new transactions
- **Multi-Wallet Support**: Track multiple wallets simultaneously

### 📊 Advanced Analytics
- **Transaction Filtering**: Smart filters for trading-relevant transactions only
- **Token Enrichment**: Automatic token metadata and pricing via Birdeye API
- **Portfolio Insights**: Comprehensive wallet analysis and statistics

### 🎨 3D Visualization
- **Interactive 3D Interface**: Immersive experience with Three.js animations
- **Customizable Themes**: Multiple visual themes including neon and dark modes
- **Responsive Design**: Optimized for all screen sizes

### 🔧 Technical Excellence
- **API Key Rotation**: Intelligent load balancing across multiple Helius API keys
- **Caching System**: Efficient data caching for optimal performance
- **Error Recovery**: Robust error handling and automatic reconnection

## 🚀 Quick Start

### Prerequisites
- Node.js 18.x or later
- Yarn 1.x (required)
- Chrome/Chromium browser

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/pulsetrack/pulsetrack-browser-extension.git
   cd pulsetrack-browser-extension
   ```

2. **Install dependencies**
   ```bash
   yarn install
   ```

3. **Configure API keys**
   ```bash
   cp config/api-keys.example.json config/api-keys.json
   # Edit config/api-keys.json with your API keys
   ```

4. **Build the extension**
   ```bash
   yarn build
   ```

5. **Load in Chrome**
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked" and select the `dist` folder

## 📖 Documentation

### 📚 User Guide
- [Getting Started](docs/user-guide/getting-started.md)
- [Tracking Wallets](docs/user-guide/tracking-wallets.md)
- [Understanding Transactions](docs/user-guide/transactions.md)
- [Customization Options](docs/user-guide/customization.md)

### 🛠️ Developer Documentation
- [Architecture Overview](docs/architecture/README.md)
- [API Integration](docs/api/README.md)
- [Development Setup](docs/development/setup.md)
- [Contributing Guidelines](CONTRIBUTING.md)

### 🔌 API Documentation
- [Helius API Integration](docs/api/helius-api.md)
- [Birdeye API Integration](docs/api/birdeye-api.md)
- [WebSocket Implementation](docs/api/websocket-api.md)

## 🏗️ Architecture

```
pulsetrack-browser-extension/
├── packages/
│   ├── core/                   # Core wallet tracking logic
│   ├── ui/                     # UI components and styling
│   └── utils/                  # Shared utilities
├── src/
│   ├── background/             # Extension background scripts
│   ├── content/                # Content scripts
│   ├── popup/                  # Extension popup
│   └── sidepanel/              # Side panel interface
├── docs/                       # Documentation
├── example/                    # Usage examples
└── tests/                      # Test suites
```

## 🔑 API Keys Setup

PulseTrack requires API keys from:

### Helius (Required)
- **Purpose**: Solana RPC and WebSocket access
- **Get API Key**: [Helius Dashboard](https://dashboard.helius.xyz/)
- **Features**: Transaction monitoring, account tracking

### Birdeye (Optional)
- **Purpose**: Token metadata and pricing data
- **Get API Key**: [Birdeye API](https://birdeye.so/api)
- **Features**: Token logos, prices, market data

### Configuration
```json
{
  "helius": [
    "your-helius-api-key-1",
    "your-helius-api-key-2"
  ],
  "birdeye": "your-birdeye-api-key"
}
```

## 🔧 Development

### Development Scripts
```bash
# Start development mode
yarn dev

# Run tests
yarn test

# Lint code
yarn lint

# Format code
yarn format

# Build for production
yarn build

# Analyze bundle
yarn analyze
```

### Testing
```bash
# Run all tests
yarn test

# Run tests in watch mode
yarn test:watch

# Generate coverage report
yarn test:coverage
```

## 🌟 Key Components

### Core Services
- **WalletTracker**: Main tracking orchestrator
- **WebSocketBackend**: Real-time connection management
- **TransactionFilter**: Smart transaction filtering
- **TokenDataService**: Token metadata enrichment

### UI Components
- **SidePanel**: Main user interface
- **TransactionList**: Transaction display and management
- **WalletInput**: Wallet address input and validation
- **RedCube**: 3D visualization component

## 📊 Performance

- **Real-time Updates**: < 100ms latency for transaction notifications
- **Memory Usage**: Optimized for minimal browser resource consumption
- **API Efficiency**: Intelligent caching and request batching
- **Bundle Size**: Optimized for fast loading

## 🔒 Security & Privacy

- **Client-side Processing**: All data processing happens locally
- **Secure API Communication**: HTTPS/WSS only connections
- **No Data Storage**: Transactions are cached temporarily only
- **Open Source**: Full transparency with public source code

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Workflow
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

### Code Standards
- ESLint + Prettier for code formatting
- Jest for testing
- Conventional commits for git messages
- JSDoc for documentation

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Solana Foundation** - For the amazing blockchain platform
- **Helius** - For reliable Solana RPC services
- **Birdeye** - For comprehensive token data
- **Three.js** - For 3D visualization capabilities
- **Open Source Community** - For the fantastic tools and libraries

## 📞 Support

- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/pulsetrack/pulsetrack-browser-extension/issues)
- 💡 **Feature Requests**: [GitHub Discussions](https://github.com/pulsetrack/pulsetrack-browser-extension/discussions)
- 📖 **Documentation**: [docs/](docs/)
- 💬 **Community**: [Discord](https://discord.gg/pulsetrack)

## 🚀 Roadmap

### v1.1 (Next Release)
- [ ] Portfolio analytics dashboard
- [ ] Price alerts and notifications
- [ ] Transaction export functionality
- [ ] Multi-language support

### v1.2 (Future)
- [ ] NFT transaction tracking
- [ ] DeFi protocol integration
- [ ] Advanced charting and analytics
- [ ] Mobile browser support

---

<div align="center">
  <p>Made with ❤️ by the PulseTrack Team</p>
  <p>
    <a href="https://github.com/pulsetrack/pulsetrack-browser-extension">⭐ Star us on GitHub</a> •
    <a href="https://twitter.com/pulsetrack">🐦 Follow on Twitter</a> •
    <a href="https://discord.gg/pulsetrack">💬 Join Discord</a>
  </p>
</div>
