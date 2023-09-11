// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;
import {Unirep} from '@unirep/contracts/Unirep.sol';
import {EpochKeyVerifierHelper} from '@unirep/contracts/verifierHelpers/EpochKeyVerifierHelper.sol';

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
    EpochKeyVerifierHelper internal epkHelper;
    
    // TODO write the document for the features
    mapping(uint256 => mapping(uint256 => postVote)) public epochKeyPostVoteMap;
    mapping(uint256 => uint256) public epochKeyPostIndex;
    mapping(bytes32 => bool) public proofNullifier;

    mapping(uint256 => bool) userRegistry;

    event Post(
        uint256 indexed epochKey,
        uint256 indexed postId,
        uint256 indexed epoch,
        string content
    );

    uint160 attesterId;

    event UserSignUp(uint256 indexed hashUserId, bool indexed fromServer);

    error UserHasRegistered(uint256 hashUserId);

    constructor(Unirep _unirep, EpochKeyVerifierHelper _epkHelper, IVerifier _dataVerifier, uint48 _epochLength) {
        // set unirep address
        unirep = _unirep;

        // set epoch key verifier helper address
        epkHelper = _epkHelper;

        // set verifier address
        dataVerifier = _dataVerifier;

        // sign up as an attester
        attesterId = uint160(msg.sender);
        unirep.attesterSignUp(_epochLength);
    }

    // sign up users in this app
    function userSignUp(
        uint256[] calldata publicSignals,
        uint256[8] calldata proof,
        uint256 hashUserId,
        bool fromServer
    ) public {
        if (userRegistry[hashUserId]) {
            revert UserHasRegistered(hashUserId);
        }

        userRegistry[hashUserId] = true;

        unirep.userSignUp(publicSignals, proof);
        emit UserSignUp(hashUserId, fromServer);
    }

    // post a content in this app
    function post(
        uint256[] memory publicSignals,
        uint256[8] memory proof,
        string memory content
    ) public {
        bytes32 nullifier = keccak256(abi.encodePacked(publicSignals, proof));
        require(!proofNullifier[nullifier], 'The proof has been used before');
        proofNullifier[nullifier] = true;

        epkHelper.verifyAndCheck(publicSignals, proof);
        EpochKeyVerifierHelper.EpochKeySignals memory signals = epkHelper
            .decodeEpochKeySignals(publicSignals);
        uint256 postId = epochKeyPostIndex[signals.epochKey];
        epochKeyPostIndex[signals.epochKey] = postId + 1;

        emit Post(signals.epochKey, postId, signals.epoch, content);
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
        unirep.attest(epochKey, targetEpoch, fieldIndex, val);
    }

    function verifyDataProof(
        uint256[5] calldata publicSignals,
        uint256[8] calldata proof
    ) public view returns (bool) {
        return dataVerifier.verifyProof(publicSignals, proof);
    }
}
