import { ethers } from 'ethers'
import { config } from 'dotenv'
import '@nomiclabs/hardhat-ethers'

import _config from '../../config'

config()
// TODO: Hardhat can't use the contracts outside currenct project
//      So we need to copy the contracts to the test folder

export default {
    defaultNetwork: 'hardhat',
    networks: {
        hardhat: {
            blockGasLimit: 12000000,
            accounts: [
                {
                    privateKey: process.env.PRIVATE_KEY ?? _config.PRIVATE_KEY,
                    balance: ethers.utils.parseEther('10000').toString(),
                },
            ],
        },
        local: {
            url: 'http://127.0.0.1:8545',
            blockGasLimit: 12000000,
            accounts: [
                '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
            ],
        },
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
    paths: {
        sources: './test/contracts',
    },
    mocha: {
        timeout: 100000000,
    },
}
