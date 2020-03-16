module.exports = {
    moduleFileExtensions: ['js', 'jsx', 'json'],
    moduleNameMapper: {
        'nav-(.*)-style': '<rootDir>/__mocks__/fileMock.js',
        '\\.(css|less|sass|scss)$': '<rootDir>/__mocks__/fileMock.js'
    },
    watchPathIgnorePatterns: ['<rootDir>/dist', '<rootDir>/node_modules']
};
