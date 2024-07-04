import { ethers } from 'ethers'
import globalFactory from 'global-factory'

import DataProofVerifier from '../../artifacts/contracts/verifiers/DataProofVerifier.sol/DataProofVerifier.json'
import ReportNegRepProofVerifier from '../../artifacts/contracts/verifiers/ReportNegRepProofVerifier.sol/ReportNegRepProofVerifier.json'
import ReportNullifierProofVerifier from '../../artifacts/contracts/verifiers/ReportNullifierProofVerifier.sol/ReportNullifierProofVerifier.json'

import ReportNegRepVHelper from '../../artifacts/contracts/verifierHelpers/ReportNegRepVHelper.sol/ReportNegRepVHelper.json'
import ReportNullifierVHelper from '../../artifacts/contracts/verifierHelpers/ReportNullifierVHelper.sol/ReportNullifierVHelper.json'

export async function deploySingleContract(
    abi: ethers.ContractInterface,
    bytecode: string,
    deployer: ethers.Signer,
    constructorArgs: any[] = [] // default value is empty
): Promise<ethers.Contract> {
    try {
        // Create a new ContractFactory instance
        const _ContractFactory = new ethers.ContractFactory(
            abi,
            bytecode,
            deployer
        )

        // Apply global factory modifications
        const ContractFactory = await globalFactory(_ContractFactory)

        // Deploy the contract with constructor arguments
        const contract = await ContractFactory.deploy(...constructorArgs)

        // Wait for the contract to be deployed
        await contract.deployed()

        return contract
    } catch (error) {
        console.error('Failed to deploy contract:', error)
        throw error
    }
}

export async function deployVerifiers(deployer: ethers.Signer) {
    /// deploy dataProofVerifier
    const dataProofVerifier = await deploySingleContract(
        DataProofVerifier.abi,
        DataProofVerifier.bytecode,
        deployer
    )
    /// deploy reportNegRepProofVerifier
    const reportNegRepProofVerifier = await deploySingleContract(
        ReportNegRepProofVerifier.abi,
        ReportNegRepProofVerifier.bytecode,
        deployer
    )
    /// deploy reportNullifierProofVerifier
    const reportNullifierProofVerifier = await deploySingleContract(
        ReportNullifierProofVerifier.abi,
        ReportNullifierProofVerifier.bytecode,
        deployer
    )

    return {
        dataProofVerifier,
        reportNegRepProofVerifier,
        reportNullifierProofVerifier,
    }
}

export async function deployVHelpers(
    deployer: ethers.Signer,
    unirep: any,
    verifiers: {
        reportNegRepProofVerifier: any
        reportNullifierProofVerifier: any
    }
) {
    const reportNegRepProofVerifier = verifiers.reportNegRepProofVerifier
    const reportNullifierProofVerifier = verifiers.reportNullifierProofVerifier

    /// deploy reportNegRepProofVHelper
    const reportNegRepVHelper = await deploySingleContract(
        ReportNegRepVHelper.abi,
        ReportNegRepVHelper.bytecode,
        deployer,
        [unirep, reportNegRepProofVerifier]
    )

    /// deploy reportNullifierProofVHelper
    const reportNullifierVHelper = await deploySingleContract(
        ReportNullifierVHelper.abi,
        ReportNullifierVHelper.bytecode,
        deployer,
        [unirep, reportNullifierProofVerifier]
    )

    return {
        reportNegRepVHelper,
        reportNullifierVHelper,
    }
}
