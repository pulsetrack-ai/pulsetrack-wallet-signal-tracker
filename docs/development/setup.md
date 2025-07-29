# Development Setup

Set up your development environment for contributing to PulseTrack.

## Prerequisites

### Required Software
- **Node.js 18.x or later**: [Download here](https://nodejs.org/)
- **Yarn 1.x**: Install with `npm install -g yarn`
- **Git**: [Download here](https://git-scm.com/)
- **Chrome/Chromium**: For testing the extension

### Recommended Tools
- **VSCode**: With TypeScript and React extensions
- **Chrome Developer Tools**: For debugging
- **Postman**: For API testing

## Initial Setup

### 1. Clone the Repository
```bash
git clone https://github.com/pulsetrack-ai/pulsetrack-browser-extension.git
cd pulsetrack-browser-extension
```

### 2. Install Dependencies
```bash
yarn install
```

### 3. Configure API Keys
```bash
cp config/api-keys.example.json config/api-keys.json
```

Edit the file with your API keys:
```json
{
  "helius": ["your-helius-api-key"],
  "birdeye": "your-birdeye-api-key"
}
```

### 4. Start Development Server
```bash
yarn dev
```

### 5. Load Extension in Chrome
1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the `dist` folder

## Development Workflow

### File Structure
```
src/
├── background/         # Extension background scripts
├── content/           # Content scripts
├── popup/             # Extension popup
├── sidepanel/         # Main UI
└── shared/            # Shared utilities
```

### Available Scripts
```bash
# Development mode with hot reload
yarn dev

# Build for production
yarn build

# Run tests
yarn test

# Lint code
yarn lint

# Format code
yarn format

# Type checking
yarn type-check
```

### Testing
```bash
# Run all tests
yarn test

# Run tests in watch mode
yarn test:watch

# Run tests with coverage
yarn test:coverage
```

## Code Standards

### TypeScript
- Use strict TypeScript configuration
- Prefer interfaces over types for object definitions
- Use proper type annotations

### React
- Use functional components with hooks
- Follow React best practices
- Use proper prop types

### Styling
- Use Tailwind CSS classes
- Follow responsive design principles
- Maintain consistent spacing and colors

### Git Workflow
1. Create feature branch from `main`
2. Make changes with clear commit messages
3. Run tests and linting
4. Create pull request
5. Wait for review and approval

## Debugging

### Extension Debugging
1. Right-click extension icon → "Inspect popup"
2. Use Chrome DevTools for debugging
3. Check console for errors

### API Debugging
- Use network tab to monitor API calls
- Check API response status and data
- Verify API key configuration

### Common Issues
- **Extension not loading**: Check manifest.json
- **API errors**: Verify API keys and network
- **Build errors**: Check Node.js version and dependencies
