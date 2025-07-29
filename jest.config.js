module.exports = {
    // Test environment
    testEnvironment: 'jsdom',
    
    // Setup files
    setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
    
    // Test patterns
    testMatch: [
        '<rootDir>/src/**/__tests__/**/*.(js|jsx|ts|tsx)',
        '<rootDir>/src/**/*.(test|spec).(js|jsx|ts|tsx)',
        '<rootDir>/packages/**/__tests__/**/*.(js|jsx|ts|tsx)',
        '<rootDir>/packages/**/*.(test|spec).(js|jsx|ts|tsx)'
    ],
    
    // Module name mapping
    moduleNameMapping: {
        '^@/(.*)$': '<rootDir>/src/$1',
        '^@core/(.*)$': '<rootDir>/packages/core/src/$1',
        '^@ui/(.*)$': '<rootDir>/packages/ui/src/$1',
        '^@utils/(.*)$': '<rootDir>/packages/utils/src/$1'
    },
    
    // Coverage configuration
    collectCoverage: true,
    collectCoverageFrom: [
        'src/**/*.{js,jsx}',
        'packages/**/src/**/*.{js,jsx}',
        '!src/**/*.test.{js,jsx}',
        '!src/**/__tests__/**',
        '!src/index.js',
        '!**/node_modules/**',
        '!**/dist/**',
        '!**/build/**'
    ],
    coverageDirectory: 'coverage',
    coverageReporters: ['text', 'lcov', 'html'],
    coverageThreshold: {
        global: {
            branches: 70,
            functions: 70,
            lines: 70,
            statements: 70
        }
    },
    
    // Transform configuration
    transform: {
        '^.+\\.(js|jsx)$': 'babel-jest'
    },
    
    // Module file extensions
    moduleFileExtensions: ['js', 'jsx', 'json'],
    
    // Ignore patterns
    testPathIgnorePatterns: [
        '<rootDir>/node_modules/',
        '<rootDir>/dist/',
        '<rootDir>/build/'
    ],
    
    // Mock configuration for browser APIs
    globals: {
        chrome: {
            runtime: {
                sendMessage: jest.fn(),
                onMessage: {
                    addListener: jest.fn()
                }
            },
            storage: {
                local: {
                    get: jest.fn(),
                    set: jest.fn()
                }
            },
            tabs: {
                query: jest.fn(),
                sendMessage: jest.fn()
            }
        },
        browser: {
            runtime: {
                sendMessage: jest.fn(),
                onMessage: {
                    addListener: jest.fn()
                }
            }
        }
    },
    
    // Clear mocks between tests
    clearMocks: true,
    
    // Restore mocks after each test
    restoreMocks: true,
    
    // Verbose output
    verbose: true,
    
    // Test timeout
    testTimeout: 10000
};
