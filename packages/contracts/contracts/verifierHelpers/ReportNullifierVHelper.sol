// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import { BaseVerifierHelper } from "@unirep/contracts/verifierHelpers/BaseVerifierHelper.sol";
import { Unirep } from "@unirep/contracts/Unirep.sol";
import { IVerifier } from "@unirep/contracts/interfaces/IVerifier.sol";
import { IVerifierHelper } from "../interfaces/IVerifierHelper.sol";

contract ReportNullifierVHelper is BaseVerifierHelper, IVerifierHelper {
    constructor(
        Unirep _unirep,
        IVerifier _verifier
    ) BaseVerifierHelper(_unirep, _verifier) {}

    /// @param publicSignals The public signals of the snark proof
    /// @return signals The EpochKeySignals
    function decodeSignals(
        uint256[] calldata publicSignals
    ) public pure returns (EpochKeySignals memory) {
        EpochKeySignals memory signals;

        (
            signals.nonce,
            signals.epoch,
            signals.attesterId,
            signals.revealNonce,
            signals.chainId
        ) = super.decodeEpochKeyControl(publicSignals[0]);
        signals.epochKey = publicSignals[1];
        
        if (signals.epochKey >= SNARK_SCALAR_FIELD) revert InvalidEpochKey();

        return signals;
    }
    
    /// @param publicSignals The public signals of the snark proof
    /// @param proof The proof data of the snark proof
    /// @return signals The EpochKeySignals
    function verifyAndCheck(
        uint256[] calldata publicSignals,
        uint256[8] calldata proof
    ) public view returns (EpochKeySignals memory) {
        EpochKeySignals memory signals = decodeSignals(publicSignals);

        if (!verifier.verifyProof(publicSignals, proof)) revert InvalidProof();

        return signals;
    }
}