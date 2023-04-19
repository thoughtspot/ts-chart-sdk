module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'jsdom',
    collectCoverage: true,
    collectCoverageFrom: ['src/**'],
    coverageDirectory: 'coverage/sdk/',
    coveragePathIgnorePatterns: ['/node_modules/', '/test/', '/*.types.ts'],
    coverageThreshold: {
        './src/main': {
            branches: 82,
            functions: 90,
            lines: 92,
        },
    },
    testPathIgnorePatterns: ['/lib/', '/docs/', '/cjs/'],
    testMatch: ['<rootDir>/src/**/*.spec.(ts|tsx)'],
    setupFilesAfterEnv: ['<rootDir>/jest-setup.js'],
    globals: {
        window: {
            location: {
                protocol: 'https:',
            },
        },
    },
};
