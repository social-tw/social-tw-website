import '@typechain/hardhat'
import '@nomiclabs/hardhat-ethers'
import '@nomicfoundation/hardhat-chai-matchers'
import * as tdly from '@tenderly/hardhat-tenderly'
import * as dotenv from 'dotenv'

dotenv.config()
tdly.setup({ automaticVerifications: true })

const { TENDERLY_ACCESS_KEY, TENDERLY_PROJECT_SLUG } = process.env
const DEVNET_RPC_URL = process.env.DEVNET_RPC_URL ?? ''
const DEFAULT_PRIVATE_KEY =
    '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'

export default {
    defaultNetwork: 'local',
    networks: {
        hardhat: {
            blockGasLimit: 12000000,
        },
        local: {
            url: 'http://127.0.0.1:8545',
            blockGasLimit: 12000000,
            accounts: [DEFAULT_PRIVATE_KEY],
        },
        dev: {
            url: process.env.ETH_PROVIDER_URL ?? '',
            accounts: [process.env.PRIVATE_KEY ?? DEFAULT_PRIVATE_KEY],
        },
        prod: {
            url: process.env.ETH_PROVIDER_URL ?? '',
            accounts: [process.env.PRIVATE_KEY ?? DEFAULT_PRIVATE_KEY],
        },
        tenderly: {
            url: DEVNET_RPC_URL,
            chainId: 137,
            accounts: [process.env.PRIVATE_KEY ?? DEFAULT_PRIVATE_KEY],
        },
    },
    tenderly: {
        project: TENDERLY_PROJECT_SLUG || 'devnet-example',
        username: 'Tenderly',
        accessKey: TENDERLY_ACCESS_KEY,
    },
    solidity: {
        compilers: [
            {
                version: '0.8.17',
                settings: {
                    optimizer: { enabled: true, runs: 200 },
                },
            },
        ],
    },
    mocha: {
        timeout: 0,
    },
}
