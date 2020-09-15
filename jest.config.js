// eslint-disable-next-line no-undef
module.exports = {
    preset: 'ts-jest/presets/js-with-ts',
    moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'json'],
    moduleNameMapper: {
        '^~(.*)$': '<rootDir>/src/$1',
        'nav-(.*)-style': '<rootDir>/__mocks__/fileMock.js',
        '\\.(css|less|sass|scss)$': '<rootDir>/__mocks__/fileMock.js',
    },
    watchPathIgnorePatterns: ['<rootDir>/dist', '<rootDir>/node_modules'],
    transform: {
        '^.+\\.tsx?$': 'ts-jest',
    },
};
