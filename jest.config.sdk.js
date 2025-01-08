module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'jsdom',
    collectCoverage: true,
    collectCoverageFrom: ['src/**'],
    coverageDirectory: 'coverage/sdk/',
    coveragePathIgnorePatterns: [
        '/node_modules/',
        '/test/',
        '/*.types.ts',
        '/src/index.ts',
    ],
    coverageThreshold: {
        './src': {
            branches: 80, // make this above 80
            functions: 95,
            lines: 95,
        },
    },
    coverageReporters: [
        'json-summary',
        'html',
        'text',
        'text-summary',
        'cobertura',
    ],
    testPathIgnorePatterns: ['/lib/', '/docs/', '/cjs/'],
    testMatch: ['<rootDir>/src/**/*.spec.(ts|tsx)'],
    setupFilesAfterEnv: ['<rootDir>/jest-setup.js'],
    globals: {
        window: {
            location: {
                protocol: 'https:',
            },
        },
        'ts-jest': {
            diagnostics: {
                ignoreCodes: [1343],
            },
            astTransformers: {
                before: [
                    {
                        path: 'node_modules/ts-jest-mock-import-meta', // or, alternatively, 'ts-jest-mock-import-meta' directly, without node_modules.
                        options: {
                            metaObjectReplacement: {
                                url: 'https://www.url.com',
                            },
                        },
                    },
                ],
            },
        },
    },
};
