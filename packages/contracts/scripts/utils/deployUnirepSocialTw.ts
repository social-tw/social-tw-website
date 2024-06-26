import { Circuit } from '@unirep/circuits'
import {
    deployUnirep,
    deployVerifierHelper,
} from '@unirep/contracts/deploy/index.js'
import { ethers } from 'ethers'

import { UnirepApp__factory as UnirepAppFactory } from '../../typechain-types'

// for deploying verifiers and verifierHelpers
import assert from 'assert'
import VerifierHelperManager from '../../artifacts/contracts/verifierHelpers/VerifierHelperManager.sol/VerifierHelperManager.json'
import {
    deploySingleContract,
    deployVHelpers,
    deployVerifiers,
} from './deployVerifiersAndHelpers'

const VHelperManager = VerifierHelperManager // alias for verifier helper manager

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

    // deploy verifiers
    console.log('Deploying Verifiers')
    const {
        dataProofVerifier,
        reportNegRepProofVerifier,
        reportNullifierProofVerifier,
    } = await deployVerifiers(deployer)

    // deploy verifierHelpers
    console.log('Deploying VerifierHelpers')
    const verifiers = {
        reportNegRepProofVerifier: reportNegRepProofVerifier.address,
        reportNullifierProofVerifier: reportNullifierProofVerifier.address,
    }
    const { reportNegRepVHelper, reportNullifierVHelper } =
        await deployVHelpers(deployer, unirep.address, verifiers)

    // deploy verifierHelperManager
    console.log('Deploying vHelperManager')
    const vHelperManager = await deploySingleContract(
        VHelperManager.abi,
        VHelperManager.bytecode,
        deployer
    )

    // register verifierHelpers in vHelperManager
    console.log('Register vHelpers into vHelperManager')
    // 1. create a mapping list for vHelper => hash value

    const vHelpers = [
        {
            identifier: 'reportNegRepProofVerifierHelper',
            address: reportNegRepVHelper.address,
        },
        {
            identifier: 'reportNullifierProofVerifierHelper',
            address: reportNullifierVHelper.address,
        },
    ].map(({ identifier, address }) => {
        const encodedId = ethers.utils.defaultAbiCoder.encode(
            ['string'],
            [identifier]
        )
        const hashId = ethers.utils.keccak256(encodedId)
        return { identifier: hashId, address }
    })
    // 2. register address into vHelperManager
    for (const vHelper of vHelpers) {
        await vHelperManager.functions.verifierRegister(
            vHelper.identifier,
            vHelper.address
        )
    }

    // 3. check via reading from contract
    for (const vHelper of vHelpers) {
        const x = await vHelperManager.registeredVerifiers(vHelper.identifier)
        assert.strictEqual(x, vHelper.address)
    }

    const AppF = new UnirepAppFactory(deployer)

    const app = await AppF.deploy(
        unirep.address,
        epkHelper.address,
        epkLiteHelper.address,
        dataProofVerifier.address,
        vHelperManager.address,
        epochLength
    )

    await app.deployTransaction.wait()

    console.log(
        `Unirep app with epoch length ${epochLength} is deployed to ${app.address}`
    )

    return {
        unirep,
        app,
        reportNegRepVHelper,
        reportNullifierVHelper,
        reportNegRepProofVerifier,
        reportNullifierProofVerifier,
    }
}
