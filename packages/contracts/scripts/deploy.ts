import { ethers } from 'hardhat'
import * as fs from 'fs'
import * as path from 'path'
import { deployApp } from './utils'
import * as hardhat from 'hardhat'
import * as envfile from 'envfile'

const epochLength = 300

main().catch((err) => {
    console.log(`Uncaught error: ${err}`)
    process.exit(1)
})

export async function main() {
    const [signer] = await ethers.getSigners()
    const { unirep, app } = await deployApp(signer, epochLength)

    const configPath = path.join(__dirname, '../../relay/.env')

    // if file not exists, create it
    if (!fs.existsSync(configPath)) {
        fs.writeFileSync(configPath, '')
    }

    fs.readFile(configPath, 'utf8', async (err, data) => {
        if (err) {
            console.error(err)
            return
        }
        const config = envfile.parse(data)

        config.UNIREP_ADDRESS = unirep.address
        config.APP_ADDRESS = app.address
        config.ETH_PROVIDER_URL = hardhat.network.config.url ?? ''
        config.PRIVATE_KEY = Array.isArray(hardhat.network.config.accounts)
            ? `${hardhat.network.config.accounts[0]}`
            : `/**
              This contract was deployed using a mnemonic. The PRIVATE_KEY variable needs to be set manually
              **/`

        // get forked block number
        const blockNum = await ethers.provider.getBlockNumber()
        config.GENESIS_BLOCK = (blockNum - 999).toString()
        await fs.promises.writeFile(configPath, envfile.stringify(config))
    })

    console.log(`Config written to ${configPath}`)
}
