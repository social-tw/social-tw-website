import type { CracoConfig } from '@craco/types'
import path from 'path'

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
            jestConfig.testEnvironmentOptions = {
                url: 'http://localhost:8000',
            }
            jestConfig.moduleNameMapper = {
                '@/(.*)$': '<rootDir>/src/$1',
                '(.*)react-datepicker.css': '<rootDir>/empty-module.js',
            }
            jestConfig.transformIgnorePatterns = [
                'node_modules/(?!@uidotdev/usehooks|nanoid/)',
            ]
            return jestConfig
        },
    },
    eslint: {
        configure: (eslintConfig, { env, paths }) => {
            if (Array.isArray(eslintConfig.extends)) {
                eslintConfig.extends.push('prettier')
            }
            return eslintConfig
        },
    },
}

export default config
