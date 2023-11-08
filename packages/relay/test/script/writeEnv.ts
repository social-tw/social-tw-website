import { ethers } from 'hardhat'
import * as fs from 'fs'
import * as path from 'path'
import * as hardhat from 'hardhat'
import * as envfile from 'envfile'

const envPath = path.join(__dirname, '../../.env')
export const writeEnv = async (unirepAddress: string, appAddress: string) => {
    fs.readFile(envPath, 'utf8', async (err, data) => {
        if (err) {
            console.error(err)
            return
        }
        const env = envfile.parse(data)

        env.UNIREP_ADDRESS = unirepAddress
        env.APP_ADDRESS = appAddress
        env.ETH_PROVIDER_URL = '' // hardhat.network.config.url
        env.PRIVATE_KEY = Array.isArray(hardhat.network.config.accounts)
            ? `${hardhat.network.config.accounts[0]}`
            : `/**
            This contract was deployed using a mnemonic. The PRIVATE_KEY variable needs to be set manually
            **/`

        // get forked block number
        const blockNum = await ethers.provider.getBlockNumber()
        env.GENESIS_BLOCK = (blockNum - 999).toString()
        await fs.promises.writeFile(envPath, envfile.stringify(env))
    })

    console.log(`Config written to ${envPath}`)
}