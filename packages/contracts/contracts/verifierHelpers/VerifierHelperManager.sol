// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import { IVerifierHelper } from "../interfaces/IVerifierHelper.sol";
import { BaseVerifierHelper } from "@unirep/contracts/verifierHelpers/BaseVerifierHelper.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";

contract VerifierHelperManager is Ownable {
    mapping(bytes32 => address) public registeredVHelpers; // see verifierRegister
    error IdentifierNotRegistered(bytes32);

    /// @dev register VerifierHelper Contract in Unirep Social-TW
    /// @param identifier sha256(verifier_contract_name)
    /// @param addr the address where the verifier is deployed  
    function verifierRegister(
        bytes32 identifier,
        address addr
    ) public onlyOwner() {
        registeredVHelpers[identifier] = addr;
    }

    /// @dev calling specific the verifyProof function by sending identifier
    /// @param publicSignals The public signals of the snark proof
    /// @param proof The proof data of the snark proof
    /// @param identifier sha256(verifier_contract_name)
    /// @return signals The EpochKeySignals from BaseVerifierHelper
    function verifyProof(
        uint256[] calldata publicSignals,
        uint256[8] calldata proof,
        bytes32 identifier
    ) public view returns (BaseVerifierHelper.EpochKeySignals memory) {
        address vHelperAddr = registeredVHelpers[identifier];
        if (vHelperAddr == address(0)) {
            revert IdentifierNotRegistered(identifier);
        }
        BaseVerifierHelper.EpochKeySignals memory signal = IVerifierHelper(vHelperAddr).verifyAndCheck(publicSignals, proof);
        return signal; 
    }
}