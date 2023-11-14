import { ethers } from 'ethers'
import { Circuit } from '@unirep/circuits'
import {
    deployUnirep,
    deployVerifierHelper,
} from '@unirep/contracts/deploy/index.js'

import globalFactory from 'global-factory'
import { UnirepApp__factory as UnirepAppFactory } from '../typechain-types'
import DataProofVerifier from '../artifacts/contracts/DataProofVerifier.sol/DataProofVerifier.json'

export async function deployApp(deployer: ethers.Signer, epochLength: number) {
    const unirep = await deployUnirep(deployer)

    const epkHelper = await deployVerifierHelper(deployer, Circuit.epochKey)
    const epkLiteHelper = await deployVerifierHelper(
        deployer,
        Circuit.epochKeyLite,
    )
    const _DataProofVerifierF = new ethers.ContractFactory(
        DataProofVerifier.abi,
        DataProofVerifier.bytecode,
        deployer,
    )
    const DataProofVerifierF = await globalFactory(_DataProofVerifierF)
    const verifier = await DataProofVerifierF.deploy()
    await verifier.deployed()

    const AppF = new UnirepAppFactory(deployer)

    const app = await AppF.deploy(
        unirep.address,
        epkHelper.address,
        epkLiteHelper.address,
        verifier.address,
        epochLength,
    )

    await app.deployTransaction.wait()

    console.log(
        `Unirep app with epoch length ${epochLength} is deployed to ${app.address}`,
    )

    return { unirep, app }
}
