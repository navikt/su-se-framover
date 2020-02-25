module.exports = {
    moduleFileExtensions: ['js', 'jsx', 'json'],
    moduleNameMapper: {
        'nav-(.*)-style': '<rootDir>/__mocks__/fileMock.js'
    },
    watchPathIgnorePatterns: ['<rootDir>/dist', '<rootDir>/node_modules']
};
