// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;
import { Unirep } from "@unirep/contracts/Unirep.sol";

// Uncomment this line to use console.log
// import "hardhat/console.sol";

interface IVerifier {
    function verifyProof(
        uint256[5] calldata publicSignals,
        uint256[8] calldata proof
    ) external view returns (bool);
}


contract UnirepApp {
    struct postVote {
        uint256 upVote;
        uint256 downVote;
    }

    Unirep public unirep;
    IVerifier internal dataVerifier;
    mapping(uint256 => mapping(uint256 => postVote)) public epochKeyPostVoteMap;
    mapping(uint256 => uint256) public epochKeyPostIndex;
    mapping(bytes32 => bool) public proofNullifier;

    event Post(uint256 indexed epochKey, uint256 indexed postId, bytes32 contentHash);

    constructor(Unirep _unirep, IVerifier _dataVerifier, uint48 _epochLength) {
        // set unirep address
        unirep = _unirep;

        // set verifier address
        dataVerifier = _dataVerifier;

        // sign up as an attester
        unirep.attesterSignUp(_epochLength);
    }

    // sign up users in this app
    function userSignUp(
        uint256[] memory publicSignals,
        uint256[8] memory proof
    ) public {
        unirep.userSignUp(publicSignals, proof);
    }

    function post(
        uint256[] memory publicSignals,
        uint256[8] memory proof,
        bytes32 contentHash
    ) public {
        bytes32 nullifier = keccak256(abi.encodePacked(publicSignals, proof));
        require(!proofNullifier[nullifier], "The proof has been used before");
        proofNullifier[nullifier] = true;

        unirep.verifyEpochKeyProof(publicSignals, proof);
        Unirep.EpochKeySignals memory signals = unirep.decodeEpochKeySignals(publicSignals);
        uint256 postId = epochKeyPostIndex[signals.epochKey];
        epochKeyPostIndex[signals.epochKey] = postId + 1;

        emit Post(signals.epochKey, postId, contentHash);
    }


    function submitManyAttestations(
        uint256 epochKey,
        uint48 targetEpoch,
        uint[] calldata fieldIndices,
        uint[] calldata vals
    ) public {
        require(fieldIndices.length == vals.length, 'arrmismatch');
        for (uint8 x = 0; x < fieldIndices.length; x++) {
            unirep.attest(epochKey, targetEpoch, fieldIndices[x], vals[x]);
        }
    }

    function submitAttestation(
        uint256 epochKey,
        uint48 targetEpoch,
        uint256 fieldIndex,
        uint256 val
    ) public {
        unirep.attest(
            epochKey,
            targetEpoch,
            fieldIndex,
            val
        );
    }

    function verifyDataProof(
        uint256[5] calldata publicSignals,
        uint256[8] calldata proof
    ) public view returns(bool) {
        return dataVerifier.verifyProof(
            publicSignals,
            proof
        );
    }
}