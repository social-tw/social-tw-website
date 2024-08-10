import { ethers } from 'ethers'

import DataProofVerifier from '../../artifacts/contracts/verifiers/DataProofVerifier.sol/DataProofVerifier.json'
import ReportNonNullifierProofVerifier from '../../artifacts/contracts/verifiers/ReportNonNullifierProofVerifier.sol/ReportNonNullifierProofVerifier.json'
import ReportNullifierProofVerifier from '../../artifacts/contracts/verifiers/ReportNullifierProofVerifier.sol/ReportNullifierProofVerifier.json'

import ReportNonNullifierVHelper from '../../artifacts/contracts/verifierHelpers/ReportNonNullifierVHelper.sol/ReportNonNullifierVHelper.json'
import ReportNullifierVHelper from '../../artifacts/contracts/verifierHelpers/ReportNullifierVHelper.sol/ReportNullifierVHelper.json'

export async function deploySingleContract(
    abi: ethers.ContractInterface,
    bytecode: string,
    deployer: ethers.Signer,
    constructorArgs: any[] = [] // default value is empty
): Promise<ethers.Contract> {
    try {
        // Create a new ContractFactory instance
        const ContractFactory = new ethers.ContractFactory(
            abi,
            bytecode,
            deployer
        )

        // TODO: uncomment this line after
        // Unirep && UnirepApp upgrade the open zeppelin lib to 5
        // Apply global factory modifications
        // const ContractFactory = await globalFactory(_ContractFactory)

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
    /// deploy reportNonNullifierProofVerifier
    const reportNonNullifierProofVerifier = await deploySingleContract(
        ReportNonNullifierProofVerifier.abi,
        ReportNonNullifierProofVerifier.bytecode,
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
        reportNonNullifierProofVerifier,
        reportNullifierProofVerifier,
    }
}

export async function deployVHelpers(
    deployer: ethers.Signer,
    unirep: any,
    verifiers: {
        reportNonNullifierProofVerifier: any
        reportNullifierProofVerifier: any
    }
) {
    const reportNonNullifierProofVerifier =
        verifiers.reportNonNullifierProofVerifier
    const reportNullifierProofVerifier = verifiers.reportNullifierProofVerifier

    /// deploy reportNonNullifierProofVHelper
    const reportNonNullifierVHelper = await deploySingleContract(
        ReportNonNullifierVHelper.abi,
        ReportNonNullifierVHelper.bytecode,
        deployer,
        [unirep, reportNonNullifierProofVerifier]
    )

    /// deploy reportNullifierProofVHelper
    const reportNullifierVHelper = await deploySingleContract(
        ReportNullifierVHelper.abi,
        ReportNullifierVHelper.bytecode,
        deployer,
        [unirep, reportNullifierProofVerifier]
    )

    return {
        reportNonNullifierVHelper,
        reportNullifierVHelper,
    }
}
