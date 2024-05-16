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
            jestConfig.testEnvironmentOptions = {
                url: 'http://localhost:8000',
            }
            jestConfig.moduleNameMapper = {
                '@/(.*)$': '<rootDir>/src/$1',
            }
            jestConfig.transformIgnorePatterns = [
                'node_modules/(?!@uidotdev/usehooks|nanoid/)',
            ]
            return jestConfig
        },
    },
}

export default config
