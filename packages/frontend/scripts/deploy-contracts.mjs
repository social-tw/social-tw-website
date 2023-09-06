import { Circuit } from '@unirep/circuits'
import {
    deployUnirep,
    deployVerifierHelper,
} from '@unirep/contracts/deploy/index.js'
import UNIREP_APP from '@unirep-app/contracts/artifacts/contracts/UnirepApp.sol/UnirepApp.json' assert { type: 'json' }
import DATA_PROOF_VIRIFIER from '@unirep-app/contracts/artifacts/contracts/DataProofVerifier.sol/DataProofVerifier.json' assert { type: 'json' }
import { ContractFactory, ethers } from 'ethers'

const GANACHE_URL = 'http://localhost:8545'
const FUNDED_PRIVATE_KEY =
    '0x0000000000000000000000000000000000000000000000000000000000000001'

async function waitForGanache() {
    for (let x = 0; x < 100; x++) {
        await new Promise((r) => setTimeout(r, 1000))
        try {
            const provider = new ethers.providers.JsonRpcProvider(GANACHE_URL)
            await provider.getNetwork()
            break
        } catch (_) {}
    }
}

async function deployUnirepSocial(
    deployer,
    UnirepAddr,
    helperAddr,
    epochLength
) {
    const verifierFactory = new ContractFactory(
        DATA_PROOF_VIRIFIER.abi,
        DATA_PROOF_VIRIFIER.bytecode,
        deployer
    )
    const verifierContract = await verifierFactory.deploy()
    await verifierContract.deployTransaction.wait()

    const appFactory = new ContractFactory(
        UNIREP_APP.abi,
        UNIREP_APP.bytecode,
        deployer
    )
    const appContract = await factory.deploy(
        unirepAddr,
        helperAddr,
        verifier.address,
        epochLength
    )
    await appContract.deployTransaction.wait()

    return appContract
}

async function main() {
    await waitForGanache()
    const provider = new ethers.providers.JsonRpcProvider(GANACHE_URL)
    await provider.getNetwork()
    const wallet = new ethers.Wallet(FUNDED_PRIVATE_KEY, provider)

    const epochLength = 5 * 60
    const unirep = await deployUnirep(wallet, { epochLength })
    const helper = await deployVerifierHelper(wallet, Circuit.epochKey)

    const unirepSocial = await deployUnirepSocial(
        wallet,
        unirep.address,
        helper.address,
        epochLength
    )

    console.log('Unirep: ', unirep.address)
    console.log('Unirep Social: ', unirepSocial.address)
}

main().catch((err) => {
    console.log(`Uncaught error: ${err}`)
    process.exit(1)
})
