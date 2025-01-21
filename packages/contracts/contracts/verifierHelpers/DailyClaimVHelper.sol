// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import { BaseVerifierHelper } from "@unirep/contracts/verifierHelpers/BaseVerifierHelper.sol";
import { Unirep } from "@unirep/contracts/Unirep.sol";
import { IVerifier } from "@unirep/contracts/interfaces/IVerifier.sol";
import { IVerifierHelper } from "../interfaces/IVerifierHelper.sol";

contract DailyClaimVHelper is BaseVerifierHelper, IVerifierHelper {
    constructor(
        Unirep _unirep,
        IVerifier _verifier
    ) BaseVerifierHelper(_unirep, _verifier) {}

    struct DailyClaimSignals {
        uint256 epochKey;
        uint256 minRep;
        uint256 maxRep;
        uint160 attesterId;
        uint48 epoch;
        uint48 chainId;
        uint8 nonce;
        bool revealNonce;
        bool proveMinRep;
        bool proveMaxRep;
        bool proveZeroRep;
        bool proveGraffiti;
        uint48 dailyEpoch;
        uint256 dailyNullifier;
    }

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
        ) = super.decodeEpochKeyControl(publicSignals[1]);
        signals.epochKey = publicSignals[0];
        
        if (signals.epochKey >= SNARK_SCALAR_FIELD) revert InvalidEpochKey();

        return signals;
    }

    /// @dev https://developer.unirep.io/docs/contracts-api/verifiers/reputation-verifier-helper#decodereputationsignals
    /// @param publicSignals The public signals of the snark proof
    /// @return signals The ReputationSignals
    function decodeDailyClaimSignals(
        uint256[] calldata publicSignals
    ) public pure returns (DailyClaimSignals memory) {
        DailyClaimSignals memory signals;
        signals.epochKey = publicSignals[0];
        signals.dailyEpoch = uint48(publicSignals[3]);
        signals.dailyNullifier = publicSignals[4];

        // now decode the control values
        (
            signals.nonce,
            signals.epoch,
            signals.attesterId,
            signals.revealNonce,
            signals.chainId
        ) = super.decodeEpochKeyControl(publicSignals[1]);

        (
            signals.minRep,
            signals.maxRep,
            signals.proveMinRep,
            signals.proveMaxRep,
            signals.proveZeroRep,
            signals.proveGraffiti
        ) = decodeReputationControl(publicSignals[2]);

        if (signals.epochKey >= SNARK_SCALAR_FIELD) revert InvalidEpochKey();
        if (signals.attesterId >= type(uint160).max) revert AttesterInvalid();

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

    /// @dev https://developer.unirep.io/docs/contracts-api/verifiers/reputation-verifier-helper#decodereputationcontrol
    /// @param control The encoded control field
    /// @return minRep The minimum rep information in the control field
    /// @return maxRep The maximum rep information in the control field
    /// @return proveMinRep Whether to prove minimum rep information in the control field
    /// @return proveMaxRep Whether to prove maximum rep information in the control field
    /// @return proveZeroRep Whether to prove zero rep information in the control field
    /// @return proveGraffiti Whether to prove graffiti information in the control field
    function decodeReputationControl(
        uint256 control
    )
        public
        pure
        returns (
            uint64 minRep,
            uint64 maxRep,
            bool proveMinRep,
            bool proveMaxRep,
            bool proveZeroRep,
            bool proveGraffiti
        )
    {
        uint8 repBits = 64;
        uint8 oneBit = 1;
        uint8 accBits = 0;
        minRep = uint64(shiftAndParse(control, accBits, repBits));
        accBits += repBits;

        maxRep = uint64(shiftAndParse(control, accBits, repBits));
        accBits += repBits;

        proveMinRep = bool(shiftAndParse(control, accBits, oneBit) != 0);
        accBits += oneBit;

        proveMaxRep = bool(shiftAndParse(control, accBits, oneBit) != 0);
        accBits += oneBit;

        proveZeroRep = bool(shiftAndParse(control, accBits, oneBit) != 0);
        accBits += oneBit;

        proveGraffiti = bool(shiftAndParse(control, accBits, oneBit) != 0);
        accBits += oneBit;
    }
}