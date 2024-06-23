// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import { IVerifierHelper } from "../interfaces/IVerifierHelper.sol";
import { BaseVerifierHelper } from "@unirep/contracts/verifierHelpers/BaseVerifierHelper.sol";

contract VerifierHelperManager {
    mapping(bytes32 => address) public registeredVerifiers; // see verifierRegister

    /// @dev register VerifierHelper Contract in Unirep Social-TW
    /// @param identifier sha256(verifier_contract_name)
    /// @param addr the address where the verifier is deployed  
    function verifierRegister(
        bytes32 identifier,
        address addr
    ) public {
        registeredVerifiers[identifier] = addr;
    }

    /// @param publicSignals The public signals of the snark proof
    /// @param proof The proof data of the snark proof
    /// @param identifier sha256(verifier_contract_name)
    /// @return signals The EpochKeySignals from BaseVerifierHelper
    function verifyProof(
        uint256[] memory publicSignals,
        uint256[8] memory proof,
        bytes32 identifier
    ) public view returns (BaseVerifierHelper.EpochKeySignals memory) {
        address verifierAddr = registeredVerifiers[identifier];
        BaseVerifierHelper.EpochKeySignals memory signal = IVerifierHelper(verifierAddr).verifyAndCheck(publicSignals, proof);
        return signal; 
    }
}