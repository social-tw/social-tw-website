import path from 'path'
import type { CracoConfig } from '@craco/types'

const config: CracoConfig = {
    webpack: {
        alias: {
            '@': path.resolve(__dirname, 'src'),
        },
        configure: (webpackConfig, { env, paths }) => {
            webpackConfig.ignoreWarnings = [
                {
                    module: /node_modules\/@react-stately/,
                },
                {
                    module: /node_modules\/@react-aria/,
                },
                {
                    module: /node_modules\/anondb/,
                },
            ]
            return webpackConfig
        },
    },
    jest: {
        configure: (jestConfig, { env, paths, resolve, rootDir }) => {
            jestConfig.roots = [`${rootDir}/test/`]
            jestConfig.testMatch = [
                '<rootDir>/**/__tests__/**/*.{js,jsx,ts,tsx}',
                '<rootDir>/**/*.{spec,test}.{js,jsx,ts,tsx}',
            ]
            jestConfig.setupFilesAfterEnv = ['<rootDir>/test/setupTests.ts']
            jestConfig.testEnvironmentOptions = {
                url: 'http://localhost:8000',
            }
            console.log(jestConfig)
            return jestConfig
        },
    },
}

export default config
