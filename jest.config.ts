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
};

export default config;
