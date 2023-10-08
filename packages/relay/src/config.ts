// imported libraries
import { ethers } from 'ethers'
import { config } from 'dotenv'
// constants and types
import ABI from '@unirep-app/contracts/abi/UnirepApp.json'
// get config from deployed contracts
import contractConfig from '../../../config'

config()

// Provide default values for process.env
// we should update the contract related env if
// we deploy contracts by devnet
Object.assign(process.env, {
    UNIREP_ADDRESS: contractConfig.UNIREP_ADDRESS ?? '0x4D137bb44553d55AE6B28B5391c6f537b06C9cc3',
    APP_ADDRESS: contractConfig.APP_ADDRESS ?? '0x0B306BF915C4d645ff596e518fAf3F9669b97016',
    ETH_PROVIDER_URL: contractConfig.ETH_PROVIDER_URL ?? 'http://127.0.0.1:8545',
    PRIVATE_KEY:
        contractConfig.PRIVATE_KEY ?? '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
    ...process.env,
})
console.log("contract config", contractConfig)
export const { UNIREP_ADDRESS, APP_ADDRESS, ETH_PROVIDER_URL, PRIVATE_KEY } =
    process.env as any

export const APP_ABI = ABI

export const DB_PATH = process.env.DB_PATH ?? ':memory:'

export const provider = ETH_PROVIDER_URL.startsWith('http')
    ? new ethers.providers.JsonRpcProvider(ETH_PROVIDER_URL)
    : new ethers.providers.WebSocketProvider(ETH_PROVIDER_URL)

export const CLIENT_URL = process.env.CLIENT_URL ?? 'http://localhost:3000'
export const CALLBACK_URL =
    process.env.CALLBACK_URL ?? 'http://localhost:8000/api/user'

// twitter related settings
export const TWITTER_ACCESS_TOKEN_URL =
    process.env.TWITTER_ACCESS_TOKEN_URL ??
    'https://api.twitter.com/2/oauth2/token'
export const TWITTER_USER_URL =
    process.env.TWITTER_USER_URL ?? 'https://api.twitter.com/2/users/me'

const isInTest = typeof global.it === 'function'
export const TWITTER_CLIENT_ID = isInTest
    ? 'test-client-id'
    : process.env.TWITTER_CLIENT_ID
export const TWITTER_CLIENT_KEY = isInTest
    ? 'test-client-key'
    : process.env.TWITTER_CLIENT_KEY
export const LOAD_POST_COUNT = 10
