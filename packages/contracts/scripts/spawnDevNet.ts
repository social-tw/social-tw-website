import { ethers } from 'hardhat'
import * as util from 'util'
import * as fs from 'fs'
import * as dotenv from 'dotenv'
import { exec as execChildProcess } from 'child_process'

dotenv.config()

const exec = util.promisify(execChildProcess)

const {
    TENDERLY_PROJECT_SLUG,
    TENDERLY_ACCOUNT_ID,
    TENDERLY_DEVNET_TEMPLATE,
    TENDERLY_ACCESS_KEY,
} = process.env

let command = `tenderly devnet spawn-rpc --project ${TENDERLY_PROJECT_SLUG} --template ${TENDERLY_DEVNET_TEMPLATE} --account ${TENDERLY_ACCOUNT_ID}  --access_key ${TENDERLY_ACCESS_KEY}`

const createDevNet = async () => {
    try {
        const { stderr } = await exec(command)
        const devNetUrl = stderr.trim().toString()

        console.log('DEVNET_RPC_URL=' + devNetUrl)

        // if file not exists, create it
        if (!fs.existsSync('.env')) {
            fs.writeFileSync('.env', '')
        }
        const fileContent = fs.readFileSync('.env', 'utf8')

        const newFileContent = fileContent.replace(/DEVNET_RPC_URL=.*/g, '')
        fs.writeFileSync('.env', newFileContent)
        fs.appendFileSync('.env', 'DEVNET_RPC_URL=' + devNetUrl)

        // generate account by pk
        const privateKey = process.env.PRIVATE_KEY!
        const provider = new ethers.providers.JsonRpcProvider(devNetUrl)
        const signer = new ethers.Wallet(privateKey, provider)
        // send money to account
        await provider.send('tenderly_setBalance', [
            [signer.address],
            ethers.utils.hexValue(ethers.utils.parseUnits('10', 'ether')),
        ])
    } catch (error) {
        console.error('Error executing command:', error)
    }
}

createDevNet()
