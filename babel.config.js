module.exports = {
    presets: [
        [
            '@babel/preset-env',
            {
                targets: {
                    chrome: '88',
                    firefox: '78',
                    edge: '88'
                },
                useBuiltIns: 'entry',
                corejs: 3
            }
        ]
    ],
    plugins: [
        '@babel/plugin-proposal-class-properties',
        '@babel/plugin-proposal-private-methods',
        '@babel/plugin-transform-runtime'
    ],
    env: {
        test: {
            presets: [
                [
                    '@babel/preset-env',
                    {
                        targets: {
                            node: 'current'
                        }
                    }
                ]
            ]
        },
        production: {
            plugins: [
                ['transform-remove-console', { exclude: ['error', 'warn'] }]
            ]
        }
    }
};
