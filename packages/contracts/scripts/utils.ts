import { ethers } from 'ethers'
import { Circuit } from '@unirep/circuits'
import {
    deployUnirep,
    deployVerifierHelper,
} from '@unirep/contracts/deploy/index.js'

import globalFactory from 'global-factory'
import UnirepApp from '../artifacts/contracts/UnirepApp.sol/UnirepApp.json'
import DataProofVerifier from '../artifacts/contracts/DataProofVerifier.sol/DataProofVerifier.json'

const epochLength = 300

export async function deployApp(deployer: ethers.Signer) {
    const unirep = await deployUnirep(deployer)

    const helper = await deployVerifierHelper(deployer, Circuit.epochKey)

    const _DataProofVerifierF = new ethers.ContractFactory(
        DataProofVerifier.abi,
        DataProofVerifier.bytecode,
        deployer
    )
    const DataProofVerifierF = await globalFactory(_DataProofVerifierF)
    const verifier = await DataProofVerifierF.deploy()
    await verifier.deployed()

    const App = new ethers.ContractFactory(
        UnirepApp.abi,
        UnirepApp.bytecode,
        deployer
    )
    const app = await App.deploy(
        unirep.address,
        helper.address,
        verifier.address,
        epochLength
    )

    await app.deployed()

    console.log(
        `Unirep app with epoch length ${epochLength} is deployed to ${app.address}`
    )

    return { unirep, app }
}
