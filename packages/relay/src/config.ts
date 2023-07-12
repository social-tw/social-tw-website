// imported libraries
import { ethers } from 'ethers'
import { config } from 'dotenv'
// constants and types
import _config from '../../../config'
import UNIREP_APP from '@unirep-app/contracts/artifacts/contracts/UnirepApp.sol/UnirepApp.json'

config()

export const UNIREP_ADDRESS =
    process.env.UNIREP_ADDRESS ?? _config.UNIREP_ADDRESS
export const APP_ADDRESS = process.env.APP_ADDRESS ?? _config.APP_ADDRESS
export const APP_ABI = UNIREP_APP.abi
export const ETH_PROVIDER_URL =
    process.env.ETH_PROVIDER_URL ?? _config.ETH_PROVIDER_URL
export const PRIVATE_KEY = process.env.PRIVATE_KEY ?? _config.PRIVATE_KEY

export const DB_PATH = process.env.DB_PATH ?? ':memory:'

export const provider = ETH_PROVIDER_URL.startsWith('http')
    ? new ethers.providers.JsonRpcProvider(ETH_PROVIDER_URL)
    : new ethers.providers.WebSocketProvider(ETH_PROVIDER_URL)
