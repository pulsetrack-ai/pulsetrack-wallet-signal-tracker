# Contributing to PulseTrack

Thank you for your interest in contributing to PulseTrack! This document provides guidelines and information for contributors.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Contribution Workflow](#contribution-workflow)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Documentation](#documentation)
- [Pull Request Process](#pull-request-process)

## Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct:

- Be respectful and inclusive
- Focus on constructive feedback
- Help create a welcoming environment for all contributors
- Report any unacceptable behavior to the maintainers

## Getting Started

### Prerequisites

- Node.js 18.x or later
- Yarn 1.x (required, not yarn 2+)
- Git
- Chrome/Chromium browser for testing

### Development Setup

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/your-username/pulsetrack-browser-extension.git
   cd pulsetrack-browser-extension
   ```

3. Install dependencies:
   ```bash
   yarn install
   ```

4. Create environment configuration:
   ```bash
   cp config/api-keys.example.json config/api-keys.json
   # Add your API keys for development
   ```

5. Start development:
   ```bash
   yarn dev
   ```

## Contribution Workflow

1. **Create an Issue**: Before starting work, create an issue or comment on an existing one
2. **Create a Branch**: Use descriptive branch names
   ```bash
   git checkout -b feature/wallet-analytics
   git checkout -b fix/websocket-reconnection
   git checkout -b docs/api-documentation
   ```

3. **Make Changes**: Implement your changes following our coding standards
4. **Test**: Ensure all tests pass and add new tests for your changes
5. **Commit**: Use conventional commit messages
6. **Push**: Push your branch to your fork
7. **Pull Request**: Create a PR with a clear description

## Coding Standards

### JavaScript/ES6+

- Use ES6+ features (arrow functions, destructuring, modules)
- Follow ESLint configuration (`.eslintrc.json`)
- Use Prettier for code formatting (`.prettierrc`)
- Prefer `const` over `let`, avoid `var`
- Use meaningful variable and function names

### File Organization

```
src/
├── components/          # UI components
├── services/           # Business logic services
├── utils/              # Utility functions
├── filters/            # Transaction filters
├── api/                # API integrations
└── types/              # Type definitions
```

### Naming Conventions

- **Files**: kebab-case (`wallet-tracker.js`)
- **Classes**: PascalCase (`WalletTracker`)
- **Functions/Variables**: camelCase (`getUserTransactions`)
- **Constants**: UPPER_SNAKE_CASE (`API_ENDPOINT`)

### Code Style

```javascript
// Good
class WalletTracker {
    constructor(options = {}) {
        this.options = {
            maxTransactions: 100,
            ...options
        };
    }

    async trackWallet(address) {
        if (!this.validateAddress(address)) {
            throw new Error('Invalid wallet address');
        }
        
        return await this.websocket.subscribe(address);
    }
}

// Avoid
var tracker = new wallet_tracker({maxTransactions: 100});
tracker.track_wallet(addr);
```

## Testing

### Running Tests

```bash
# Run all tests
yarn test

# Run tests in watch mode
yarn test:watch

# Run tests with coverage
yarn test:coverage

# Run specific test file
yarn test src/services/wallet-tracker.test.js
```

### Writing Tests

- Use Jest for unit tests
- Test files should end with `.test.js`
- Place tests next to the code they test
- Aim for good test coverage (>80%)

```javascript
// Example test
describe('WalletTracker', () => {
    let tracker;

    beforeEach(() => {
        tracker = new WalletTracker();
    });

    test('should validate wallet addresses', () => {
        expect(tracker.validateAddress('valid-address')).toBe(true);
        expect(tracker.validateAddress('invalid')).toBe(false);
    });
});
```

## Documentation

### Code Documentation

- Use JSDoc comments for functions and classes
- Include parameter types and return values
- Provide usage examples for complex functions

```javascript
/**
 * Track a Solana wallet for transactions
 * @param {string} walletAddress - The Solana wallet address to track
 * @param {Object} options - Tracking options
 * @param {boolean} options.includeNFTs - Whether to include NFT transactions
 * @returns {Promise<boolean>} Success status
 * @example
 * const success = await tracker.trackWallet('7xKXt...', { includeNFTs: true });
 */
async trackWallet(walletAddress, options = {}) {
    // Implementation
}
```

### Documentation Updates

- Update relevant documentation when adding features
- Include examples in the `example/` directory
- Update API documentation in `docs/api/`

## Pull Request Process

### PR Title Format

Use conventional commit format:
- `feat: add wallet portfolio analytics`
- `fix: resolve WebSocket reconnection issue`
- `docs: update API documentation`
- `test: add transaction filter tests`

### PR Description Template

```markdown
## Description
Brief description of the changes.

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Manual testing completed
- [ ] Browser extension tested

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] Tests added/updated
```

### Review Process

1. **Automated Checks**: Ensure CI/CD passes
2. **Code Review**: Address reviewer feedback
3. **Testing**: Verify functionality works as expected
4. **Documentation**: Confirm docs are updated
5. **Approval**: Get approval from maintainers

## API Keys and Environment

For development, you'll need API keys for:

- **Helius**: Solana RPC and WebSocket access
- **Birdeye**: Token data and pricing

Create `config/api-keys.json`:
```json
{
  "helius": [
    "your-helius-api-key-1",
    "your-helius-api-key-2"
  ],
  "birdeye": "your-birdeye-api-key"
}
```

## Getting Help

- **Issues**: Check existing issues or create a new one
- **Discussions**: Use GitHub Discussions for questions
- **Documentation**: Check the `docs/` directory
- **Examples**: Look at `example/` for usage examples

## Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes for significant contributions
- Special thanks in major releases

Thank you for contributing to PulseTrack! 🚀
