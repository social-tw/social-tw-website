import { ethers } from 'ethers'

import _config from '../../../config'

import { config } from 'dotenv'
config()

export const UNIREP_ADDRESS =
    process.env.UNIREP_ADDRESS ?? _config.UNIREP_ADDRESS
export const APP_ADDRESS = process.env.APP_ADDRESS ?? _config.APP_ADDRESS
export const ETH_PROVIDER_URL =
    process.env.ETH_PROVIDER_URL ?? _config.ETH_PROVIDER_URL
export const PRIVATE_KEY = process.env.PRIVATE_KEY ?? _config.PRIVATE_KEY

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

export const TWITTER_CLIENT_ID = process.env.TWITTER_CLIENT_ID
export const TWITTER_CLIENT_KEY = process.env.TWITTER_CLIENT_KEY
