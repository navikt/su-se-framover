import type { Config } from 'jest';

const config: Config = {
    preset: 'ts-jest/presets/js-with-ts',
    moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'json'],
    moduleNameMapper: {
        '~src/(.*)': '<rootDir>/src/$1',
        '\\.(css|less|sass|scss)$': '<rootDir>/__mocks__/fileMock.js',
    },
    testPathIgnorePatterns: ['<rootDir>/dist/'],
    watchPathIgnorePatterns: ['<rootDir>/dist', '<rootDir>/node_modules'],
    transform: {
        '^.+\\.tsx?$': 'ts-jest',
    },
    transformIgnorePatterns: ['node_modules/(?!(react-intl|@formatjs/intl|@formatjs/icu-messageformat-parser|@formatjs/icu-skeleton-parser|@formatjs/fast-memoize|intl-messageformat|date-fns)/)'],
};

export default config;
