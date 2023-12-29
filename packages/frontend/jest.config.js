/** @type {import('ts-jest').JestConfigWithTsJest} */
// eslint-disable-next-line no-undef
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'jsdom',
    moduleNameMapper: {
        '@testing-library/react':
            '<rootDir>/node_modules/@testing-library/react',
        '@types/jest': 'jest',
        '^@/(.*)$': '<rootDir>/src/$1',
    },
}
