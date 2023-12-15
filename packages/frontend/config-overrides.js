module.exports = {
    jest: (config) => {
        config.preset = 'ts-jest'
        config.testEnvironment = 'jsdom'
        config.moduleNameMapper = {
            ...config.moduleNameMapper,
            '^@/(.*)$': '<rootDir>/src/$1',
        }
        return config
    },
}
