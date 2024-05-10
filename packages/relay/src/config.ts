// imported libraries
import { ethers } from 'ethers'
import { config } from 'dotenv'
// constants and types
import ABI from '@unirep-app/contracts/abi/UnirepApp.json'

config()

// Provide default values for process.env
Object.assign(process.env, {
    UNIREP_ADDRESS: '0x83cB6AF63eAfEc7998cC601eC3f56d064892b386',
    APP_ADDRESS: '0x959922bE3CAee4b8Cd9a407cc3ac1C251C2007B1',
    ETH_PROVIDER_URL: 'http://127.0.0.1:8545',
    PRIVATE_KEY:
        process.env.PRIVATE_KEY ??
        '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
    GENESIS_BLOCK: process.env.GENESIS_BLOCK ?? '0',
    ...process.env,
})

export const {
    UNIREP_ADDRESS,
    APP_ADDRESS,
    ETH_PROVIDER_URL,
    PRIVATE_KEY,
    GENESIS_BLOCK,
} = process.env as any

export const APP_ABI = ABI

export const DB_PATH = process.env.DB_PATH ?? ':memory:'
export const ENV = process.env.ENV ?? 'local'

export const provider = ETH_PROVIDER_URL.startsWith('http')
    ? new ethers.providers.JsonRpcProvider(ETH_PROVIDER_URL)
    : new ethers.providers.WebSocketProvider(ETH_PROVIDER_URL)

export const CLIENT_URL = process.env.CLIENT_URL ?? 'http://localhost:3000'
export const CALLBACK_URL = process.env.SERVER
    ? `${process.env.SERVER}/api/user`
    : 'http://localhost:8000/api/user'

// twitter related settings
export const TWITTER_ACCESS_TOKEN_URL = 'https://api.twitter.com/2/oauth2/token'
export const TWITTER_USER_URL = 'https://api.twitter.com/2/users/me'

export const IS_IN_TEST = typeof global.it === 'function'
export const RESET_DATABASE = IS_IN_TEST
    ? 'true'
    : process.env.RESET_DATABASE ?? 'false'
export const TWITTER_CLIENT_ID = IS_IN_TEST
    ? 'test-client-id'
    : process.env.TWITTER_CLIENT_ID
export const TWITTER_CLIENT_KEY = IS_IN_TEST
    ? 'test-client-key'
    : process.env.TWITTER_CLIENT_KEY
export const LOAD_POST_COUNT = 10
export const EPOCHKEYS_AMOUNT = 3
// default update post order interval 30 minutes convert into milisecond
export const UPDATE_POST_ORDER_INTERVAL = 0.5 * 60 * 60 * 1000
export const DAY_DIFF_STAEMENT = DB_PATH.startsWith('postgres')
    ? '(EXTRACT (DAY FROM NOW()::timestamp - TO_TIMESTAMP(publishedAt::bigint / 1000)::date))'
    : "FLOOR(JULIANDAY('now') - JULIANDAY(DATETIME(CAST(publishedAt AS INTEGER) / 1000, 'unixepoch')))"
