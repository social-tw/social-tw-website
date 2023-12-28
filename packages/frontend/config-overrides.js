module.exports = {
    jest: (config) => {
        // config.preset = 'ts-jest'
        ;(config.testEnvironment = 'jsdom'),
            (config.transformIgnorePatterns = [
                'node_modules/(?!@uidotdev/usehooks|nanoid/)',
            ]),
            (config.transform = {
                '\\.(ts|tsx)$': 'ts-jest',
                '\\.[jt]sx?$': 'babel-jest',
                '\\.(jpg|jpeg|png|gif|webp)$':
                    '<rootDir>/__mocks__/jestImageTransformer.js',
                '\\.svg$': '<rootDir>/__mocks__/svgrMock.js',
            }),
            (config.moduleNameMapper = {
                ...config.moduleNameMapper,
                '^@/(.*)$': '<rootDir>/src/$1',
                '\\.css$': '<rootDir>/__mocks__/styleMock.js',
            })
        config.setupFilesAfterEnv = [
            ...config.setupFilesAfterEnv,
            '<rootDir>/__mocks__/setupTests.js',
        ]
        return config
    },
}
