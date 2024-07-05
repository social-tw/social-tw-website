// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import { Unirep } from "@unirep/contracts/Unirep.sol";
import { EpochKeyVerifierHelper } from "@unirep/contracts/verifierHelpers/EpochKeyVerifierHelper.sol";
import { EpochKeyLiteVerifierHelper } from "@unirep/contracts/verifierHelpers/EpochKeyLiteVerifierHelper.sol";
import { BaseVerifierHelper } from "@unirep/contracts/verifierHelpers/BaseVerifierHelper.sol";
import { VerifierHelperManager } from "./verifierHelpers/VerifierHelperManager.sol";
// Uncomment this line to use console.log
// import "hardhat/console.sol";

interface IVerifier {
    function verifyProof(
        uint256[] calldata publicSignals,
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
    EpochKeyLiteVerifierHelper internal epkLiteHelper;
    VerifierHelperManager internal verifierHelperManager;

    // a global variable to store the latest postId
    uint256 public latestPostId;

    mapping(uint256 => uint256) public postCommentIndex; // postId -> commentId
    mapping(uint256 => mapping(uint256 => uint256)) epochKeyCommentMap; // postId-commentId -> epochKey
    mapping(bytes32 => bool) public proofNullifier;

    mapping(uint256 => bool) public userRegistry;

    // Positive Reputation field index in Unirep protocol
    uint256 public immutable posRepFieldIndex = 0;

    // Nagative Reputation field index in Unirep protocol
    uint256 public immutable negRepFieldIndex = 1;

    event Post(
        uint256 indexed epochKey,
        uint256 indexed postId,
        uint256 indexed epoch,
        string content
    );

    event Comment(
        uint256 indexed epochKey,
        uint256 indexed postId,
        uint256 indexed commentId,
        uint256 epoch,
        string content
    );

    event UpdatedComment(
        uint256 indexed epochKey,
        uint256 indexed postId,
        uint256 indexed commentId,
        uint256 epoch,
        string newContent
    );

    event ClaimPosRep(
        uint256 indexed epochKey,
        uint256 epoch
    );

    uint160 immutable attesterId;

    event UserSignUp(uint256 indexed hashUserId, bool indexed fromServer);

    error UserHasRegistered(uint256 hashUserId);
    error ProofHasUsed();
    error InvalidAttester();
    error InvalidEpoch();
    error ArrMismatch();
    error InvalidCommentEpochKey(uint256 epochKey);
    error InvalidCommentId(uint256 commentId);

    constructor(
        Unirep _unirep,
        EpochKeyVerifierHelper _epkHelper,
        EpochKeyLiteVerifierHelper _epkLiteHelper,
        IVerifier _dataVerifier,
        VerifierHelperManager _verifierHelperManager,
        uint48 _epochLength
    ) {
        // set unirep address
        unirep = _unirep;

        // set epoch key verifier helper address
        epkHelper = _epkHelper;

        // set epoch key lite verifier helper address
        epkLiteHelper = _epkLiteHelper;

        // set verifier address
        dataVerifier = _dataVerifier;

        // set verifierHelper manager
        verifierHelperManager = _verifierHelperManager;

        // sign up as an attester
        attesterId = uint160(msg.sender);
        unirep.attesterSignUp(_epochLength);
    }

    /** 
     * Sign up users in this app
     * @param publicSignals: public signals
     * @param proof: UserSignUpProof
     * @param hashUserId: hash of the userId
     * @param fromServer: if the user sign up from the server
     */
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

    /**
     * Post a content in this app
     * @param publicSignals: public signals
     * @param proof: epockKeyProof from the user
     * @param content: content of this post
     */ 
    function post(
        uint256[] memory publicSignals,
        uint256[8] memory proof,
        string memory content
    ) public {
        // check if proof is used before
        bytes32 nullifier = keccak256(abi.encodePacked(publicSignals, proof));
        if (proofNullifier[nullifier]) {
            revert ProofHasUsed();
        }

        proofNullifier[nullifier] = true;

        EpochKeyVerifierHelper.EpochKeySignals memory signals = epkHelper
            .decodeEpochKeySignals(publicSignals);

        // check the epoch != current epoch (ppl can only post in current aepoch)
        uint48 epoch = unirep.attesterCurrentEpoch(signals.attesterId);
        if (signals.epoch != epoch) {
            revert InvalidEpoch();
        }

        // should check lastly
        epkHelper.verifyAndCheckCaller(publicSignals, proof);

        emit Post(signals.epochKey, latestPostId, signals.epoch, content);
        latestPostId++;

    }

    /**
     * Leave a comment under a post
     * @param publicSignals: public signals
     * @param proof: epockKeyProof from the user
     * @param postId: postId where the comment wanna leave
     * @param content: comment content
     */
    function leaveComment(
        uint256[] memory publicSignals,
        uint256[8] memory proof,
        uint256 postId,
        string memory content
    ) public {
        // check if proof is used before
        bytes32 nullifier = keccak256(abi.encodePacked(publicSignals, proof));
        if (proofNullifier[nullifier]) {
            revert ProofHasUsed();
        }
        proofNullifier[nullifier] = true;

        EpochKeyVerifierHelper.EpochKeySignals memory signals = epkHelper
            .decodeEpochKeySignals(publicSignals);

        // check the epoch != current epoch (ppl can only post in current aepoch)
        uint48 epoch = unirep.attesterCurrentEpoch(signals.attesterId);
        if (signals.epoch != epoch) {
            revert InvalidEpoch();
        }

        // check if the proof is valid
        epkHelper.verifyAndCheckCaller(publicSignals, proof);

        uint256 commentId = postCommentIndex[postId];
        epochKeyCommentMap[postId][commentId] = signals.epochKey;
        postCommentIndex[postId] = commentId + 1;

        emit Comment(
            signals.epochKey,
            postId,
            commentId,
            signals.epoch,
            content
        );
    }

    /**
     * Update the content of a specific comment
     * @param publicSignals: public signals
     * @param proof: epochKeyLiteProof
     * @param postId: postId
     * @param commentId: the commentId user wants to update
     * @param newContent: new content of the comment. if this == "", means removing
     */
    function editComment(
        uint256[] memory publicSignals,
        uint256[8] memory proof,
        uint256 postId,
        uint256 commentId,
        string memory newContent
    ) public {
        // check if proof is used before
        bytes32 nullifier = keccak256(abi.encodePacked(publicSignals, proof));
        if (proofNullifier[nullifier]) {
            revert ProofHasUsed();
        }

        proofNullifier[nullifier] = true;

        EpochKeyLiteVerifierHelper.EpochKeySignals
            memory signals = epkLiteHelper.decodeEpochKeyLiteSignals(
                publicSignals
            );

        // check the epoch != current epoch (ppl can only post in current aepoch)
        uint48 epoch = unirep.attesterCurrentEpoch(signals.attesterId);
        if (signals.epoch > epoch) {
            revert InvalidEpoch();
        }

        if (commentId >= postCommentIndex[postId]) {
            revert InvalidCommentId(commentId);
        }

        // check the identity
        if (epochKeyCommentMap[postId][commentId] != signals.epochKey) {
            revert InvalidCommentEpochKey(signals.epochKey);
        }

        epkLiteHelper.verifyAndCheckCaller(publicSignals, proof);

        emit UpdatedComment(
            signals.epochKey,
            postId,
            commentId,
            signals.epoch,
            newContent
        );
    }

    /// @param publicSignals The public signals of the snark proof
    /// @param proof The proof data of the snark proof
    /// @param identifier sha256(verifier_contract_name)
    /// @return signals The EpochKeySignals from BaseVerifierHelper
    function verifyWithIdentifier(
        uint256[] calldata publicSignals,
        uint256[8] calldata proof,
        bytes32 identifier
    ) public view returns (BaseVerifierHelper.EpochKeySignals memory) {
        BaseVerifierHelper.EpochKeySignals memory signal = verifierHelperManager.verifyProof(
            publicSignals,
            proof,
            identifier
        );
        return signal;
    }

    function submitManyAttestations(
        uint256 epochKey,
        uint48 targetEpoch,
        uint256[] calldata fieldIndices,
        uint256[] calldata vals
    ) public {
        if (fieldIndices.length != vals.length) {
            revert ArrMismatch();
        }

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
        uint256[] calldata publicSignals,
        uint256[8] calldata proof
    ) public view returns (bool) {
        return dataVerifier.verifyProof(publicSignals, proof);
    }

    /**
     * Claim the report positive reputation
     * @param publicSignals: public signals
     * @param proof: epochKeyProof
     * @param change: reputation score
     */
    function claimReportPosRep(
        uint256[] calldata publicSignals,
        uint256[8] calldata proof, // report nullifier proof
        bytes32 identifier,
        uint256 change
    ) public {
        // check if proof is used before
        bytes32 nullifier = keccak256(abi.encodePacked(publicSignals, proof));
        if (proofNullifier[nullifier]) {
            revert ProofHasUsed();
        }

        proofNullifier[nullifier] = true;

        verifierHelperManager.verifyProof(publicSignals, proof, identifier);

        uint256 epochKey = publicSignals[0];
        // TODO: need to check corresponding indices of epoch & attesterId
        // check the epoch != current epoch (ppl can only post in current aepoch)
        uint48 epoch = unirep.attesterCurrentEpoch(uint160(publicSignals[2]));
        if (publicSignals[1] != epoch) {
            revert InvalidEpoch();
        }

        // Attesting on Unirep contract:
        // Positive Reputation field index in Unirep social
        unirep.attest(
            epochKey,
            epoch,
            posRepFieldIndex, // field index: posRep
            change // should be 3
        );

        emit ClaimPosRep(epochKey, epoch);
    }
}
