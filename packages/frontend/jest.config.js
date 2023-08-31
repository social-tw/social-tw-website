/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'jsdom',
    moduleNameMapper: {
        '@testing-library/react':
            '<rootDir>/node_modules/@testing-library/react',
        '@types/jest': 'jest',
    },
}
