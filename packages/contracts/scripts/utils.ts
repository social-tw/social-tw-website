import { ethers } from 'ethers'
import { Circuit } from '@unirep/circuits'
import {
    deployUnirep,
    deployVerifierHelper,
} from '@unirep/contracts/deploy/index.js'

import globalFactory from 'global-factory'
import { UnirepApp__factory as UnirepAppFactory } from '../typechain-types'
import DataProofVerifier from '../artifacts/contracts/verifiers/DataProofVerifier.sol/DataProofVerifier.json'
import VerifierHelperManager from '../artifacts/contracts/verifierHelpers/VerifierHelperManager.sol/VerifierHelperManager.json'

export async function deployApp(deployer: ethers.Signer, epochLength: number) {
    const unirep = await deployUnirep(deployer)

    const epkHelper = await deployVerifierHelper(
        unirep.address,
        deployer,
        Circuit.epochKey
    )
    const epkLiteHelper = await deployVerifierHelper(
        unirep.address,
        deployer,
        Circuit.epochKeyLite
    )
    const _DataProofVerifierF = new ethers.ContractFactory(
        DataProofVerifier.abi,
        DataProofVerifier.bytecode,
        deployer
    )
    const DataProofVerifierF = await globalFactory(_DataProofVerifierF)
    const verifier = await DataProofVerifierF.deploy()
    await verifier.deployed()

    // deploy verifierHelperManager
    const _VerifierHelperManagerF = new ethers.ContractFactory(
        VerifierHelperManager.abi,
        VerifierHelperManager.bytecode,
        deployer
    )
    const VerifierHelperManagerF = await globalFactory(_VerifierHelperManagerF)
    const verifierHelperManager = await VerifierHelperManagerF.deploy()
    await verifierHelperManager.deployed()

    const AppF = new UnirepAppFactory(deployer)

    const app = await AppF.deploy(
        unirep.address,
        epkHelper.address,
        epkLiteHelper.address,
        verifier.address,
        verifierHelperManager.address,
        epochLength
    )

    await app.deployTransaction.wait()

    console.log(
        `Unirep app with epoch length ${epochLength} is deployed to ${app.address}`
    )

    return { unirep, app }
}
