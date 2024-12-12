// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import { Unirep } from "@unirep/contracts/Unirep.sol";
import { IVerifier } from "@unirep/contracts/interfaces/IVerifier.sol";
import { BaseVerifierHelper } from "@unirep/contracts/verifierHelpers/BaseVerifierHelper.sol";

/// @title IVerifierHelper
/// @dev Interface for VerifierHelpers in Unirep Social-TW
interface IVerifierHelper {
    /// @param publicSignals The public signals of the snark proof
    /// @return signals The EpochKeySignals
    function decodeSignals(
        uint256[] calldata publicSignals
    ) external pure returns (BaseVerifierHelper.EpochKeySignals memory);

    /// @param publicSignals The public signals of the snark proof
    /// @param proof The proof data of the snark proof
    /// @return signals The EpochKeySignals
    function verifyAndCheck(
        uint256[] calldata publicSignals,
        uint256[8] calldata proof
    ) external view returns (BaseVerifierHelper.EpochKeySignals memory);

    /// @param publicSignals The public signals of the snark proof
    /// @param proof The proof data of the snark proof
    /// @return signals The EpochKeySignals
    function verifyAndCheck(
        uint256[] calldata publicSignals,
        uint256[8] calldata proof
    ) external view returns (BaseVerifierHelper.ReputationSignals memory);
}
