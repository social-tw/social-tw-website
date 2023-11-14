import { ethers } from 'hardhat'
import * as fs from 'fs'
import * as path from 'path'
import { deployApp } from './utils'
import * as hardhat from 'hardhat'

const epochLength = 300

main().catch((err) => {
    console.log(`Uncaught error: ${err}`)
    process.exit(1)
})

export async function main() {
    const [signer] = await ethers.getSigners()
    const { unirep, app } = await deployApp(signer, epochLength)

    console.log(
        `Unirep app with epoch length ${epochLength} is deployed to ${app.address}`,
    )

    const config = `export default {
    UNIREP_ADDRESS: '${unirep.address}',
    APP_ADDRESS: '${app.address}',
    ETH_PROVIDER_URL: '${hardhat.network.config.url ?? ''}',
    ${
        Array.isArray(hardhat.network.config.accounts)
            ? `PRIVATE_KEY: '${hardhat.network.config.accounts[0]}',`
            : `/**
      This contract was deployed using a mnemonic. The PRIVATE_KEY variable needs to be set manually
    **/`
    }
  }
  `

    const configPath = path.join(__dirname, '../../../config.ts')
    await fs.promises.writeFile(configPath, config)

    console.log(`Config written to ${configPath}`)
}
