// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import {Unirep} from "@unirep/contracts/Unirep.sol";
import {ReputationVerifierHelper} from "@unirep/contracts/verifierHelpers/ReputationVerifierHelper.sol";
import {EpochKeyLiteVerifierHelper} from "@unirep/contracts/verifierHelpers/EpochKeyLiteVerifierHelper.sol";
import {BaseVerifierHelper} from "@unirep/contracts/verifierHelpers/BaseVerifierHelper.sol";
import {VerifierHelperManager} from "./verifierHelpers/VerifierHelperManager.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {DailyClaimVHelper} from "./verifierHelpers/DailyClaimVHelper.sol";

interface IVerifier {
    function verifyProof(uint256[] calldata publicSignals, uint256[8] calldata proof) external view returns (bool);
}

contract UnirepApp is Ownable {
    struct postVote {
        uint256 upVote;
        uint256 downVote;
    }

    struct DailyEpochData {
        uint48 startTimestamp;
        uint48 currentEpoch;
        uint48 epochLength;
    }

    Unirep public unirep;
    IVerifier internal dataVerifier;
    ReputationVerifierHelper internal repHelper;
    EpochKeyLiteVerifierHelper internal epkLiteHelper;
    VerifierHelperManager internal verifierHelperManager;

    // a global variable to store the latest postId
    uint256 public latestPostId;

    mapping(uint256 => uint256) public postCommentIndex; // postId -> commentId
    mapping(uint256 => mapping(uint256 => uint256)) epochKeyCommentMap; // postId-commentId -> epochKey
    mapping(bytes32 => bool) public proofNullifier;

    mapping(uint256 => bool) public userRegistry;
    DailyEpochData public dailyEpochData;

    // Positive Reputation field index in Unirep protocol
    uint256 public immutable posRepFieldIndex = 0;

    // Nagative Reputation field index in Unirep protocol
    uint256 public immutable negRepFieldIndex = 1;

    event Post(uint256 indexed epochKey, uint256 indexed postId, uint256 indexed epoch, string content);

    event Comment(
        uint256 indexed epochKey, uint256 indexed postId, uint256 indexed commentId, uint256 epoch, string content
    );

    event UpdatedComment(
        uint256 indexed epochKey, uint256 indexed postId, uint256 indexed commentId, uint256 epoch, string newContent
    );

    event ClaimPosRep(uint256 indexed epochKey, uint256 epoch);

    event ClaimNegRep(uint256 indexed epochKey, uint256 epoch);

    event DailyEpochEnded(uint48 indexed epoch);

    uint160 immutable attesterId;

    event UserSignUp(uint256 indexed hashUserId, bool indexed fromServer);

    error UserHasRegistered(uint256 hashUserId);
    error ProofHasUsed();
    error InvalidAttester();
    error InvalidEpoch();
    error ArrMismatch();
    error InvalidCommentEpochKey(uint256 epochKey);
    error InvalidCommentId(uint256 commentId);
    error NonNegativeReputation();
    error InvalidDailyEpoch();

    constructor(
        Unirep _unirep,
        ReputationVerifierHelper _repHelper,
        EpochKeyLiteVerifierHelper _epkLiteHelper,
        IVerifier _dataVerifier,
        VerifierHelperManager _verifierHelperManager,
        uint48 _epochLength
    ) {
        // set unirep address
        unirep = _unirep;

        // set reputation verifier helper address
        repHelper = _repHelper;

        // set epoch key lite verifier helper address
        epkLiteHelper = _epkLiteHelper;

        // set verifier address
        dataVerifier = _dataVerifier;

        // set verifierHelper manager
        verifierHelperManager = _verifierHelperManager;

        dailyEpochData =
            DailyEpochData({startTimestamp: uint48(block.timestamp), currentEpoch: 0, epochLength: 24 * 60 * 60});

        // sign up as an attester
        attesterId = uint160(msg.sender);
        unirep.attesterSignUp(_epochLength);
    }

    /// @dev Decode and verify the reputation proofs
    /// @return proofSignals proof signals or fails
    function decodeAndVerify(uint256[] calldata publicSignals, uint256[8] calldata proof)
        internal
        view
        returns (ReputationVerifierHelper.ReputationSignals memory proofSignals)
    {
        return repHelper.verifyAndCheckCaller(publicSignals, proof);
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
    function post(uint256[] calldata publicSignals, uint256[8] calldata proof, string memory content) public {
        // check if proof is used before
        bytes32 nullifier = keccak256(abi.encodePacked(publicSignals, proof));
        if (proofNullifier[nullifier]) {
            revert ProofHasUsed();
        }

        proofNullifier[nullifier] = true;

        ReputationVerifierHelper.ReputationSignals memory signals = decodeAndVerify(publicSignals, proof);

        // check the epoch != current epoch (ppl can only post in current aepoch)
        uint48 epoch = unirep.attesterCurrentEpoch(signals.attesterId);
        if (signals.epoch != epoch) {
            revert InvalidEpoch();
        }

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
        uint256[] calldata publicSignals,
        uint256[8] calldata proof,
        uint256 postId,
        string memory content
    ) public {
        // check if proof is used before
        bytes32 nullifier = keccak256(abi.encodePacked(publicSignals, proof));
        if (proofNullifier[nullifier]) {
            revert ProofHasUsed();
        }
        proofNullifier[nullifier] = true;

        ReputationVerifierHelper.ReputationSignals memory signals = decodeAndVerify(publicSignals, proof);

        // check the epoch != current epoch (ppl can only leave comment in current epoch)
        uint48 epoch = unirep.attesterCurrentEpoch(signals.attesterId);
        if (signals.epoch != epoch) {
            revert InvalidEpoch();
        }

        uint256 commentId = postCommentIndex[postId];
        epochKeyCommentMap[postId][commentId] = signals.epochKey;
        postCommentIndex[postId] = commentId + 1;

        emit Comment(signals.epochKey, postId, commentId, signals.epoch, content);
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
        uint256[] calldata publicSignals,
        uint256[8] calldata proof,
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

        EpochKeyLiteVerifierHelper.EpochKeySignals memory signals =
            epkLiteHelper.decodeEpochKeyLiteSignals(publicSignals);

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

        emit UpdatedComment(signals.epochKey, postId, commentId, signals.epoch, newContent);
    }

    /// @param publicSignals The public signals of the snark proof
    /// @param proof The proof data of the snark proof
    /// @param identifier sha256(verifier_contract_name)
    /// @return signals The EpochKeySignals from BaseVerifierHelper
    function verifyWithIdentifier(uint256[] calldata publicSignals, uint256[8] calldata proof, bytes32 identifier)
        public
        view
        returns (BaseVerifierHelper.EpochKeySignals memory)
    {
        BaseVerifierHelper.EpochKeySignals memory signal =
            verifierHelperManager.verifyProof(publicSignals, proof, identifier);
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

    function submitAttestation(uint256 epochKey, uint48 targetEpoch, uint256 fieldIndex, uint256 val) public {
        unirep.attest(epochKey, targetEpoch, fieldIndex, val);
    }

    function verifyDataProof(uint256[] calldata publicSignals, uint256[8] calldata proof) public view returns (bool) {
        return dataVerifier.verifyProof(publicSignals, proof);
    }

    /**
     * Claim the report positive reputation
     * @param publicSignals: public signals
     * @param proof: report nullifier proof
     * @param change: reputation score
     */
    function claimReportPosRep(
        uint256[] calldata publicSignals,
        uint256[8] calldata proof,
        bytes32 identifier,
        uint256 change
    ) public onlyOwner {
        // check if proof is used before
        bytes32 nullifier = keccak256(abi.encodePacked(publicSignals, proof));
        if (proofNullifier[nullifier]) {
            revert ProofHasUsed();
        }

        proofNullifier[nullifier] = true;

        BaseVerifierHelper.EpochKeySignals memory signals =
            verifierHelperManager.verifyProof(publicSignals, proof, identifier);

        // check the epoch != current epoch (ppl can only claim in current epoch)
        uint48 epoch = unirep.attesterCurrentEpoch(signals.attesterId);
        if (signals.epoch > epoch) {
            revert InvalidEpoch();
        }

        // attesting on Unirep contract:
        unirep.attest(
            signals.epochKey,
            epoch,
            posRepFieldIndex, // field index: posRep
            change // should be 3
        );

        emit ClaimPosRep(signals.epochKey, epoch);
    }

    /**
     * Claim the daily login reputation
     * @param publicSignals: public signals
     * @param proof: daily claim proof
     */
    function claimDailyLoginRep(uint256[] calldata publicSignals, uint256[8] calldata proof, bytes32 identifier)
        public
        onlyOwner
    {
        _updateDailyEpochIfNeeded();

        DailyClaimVHelper dailyClaimVHelpers = DailyClaimVHelper(verifierHelperManager.registeredVHelpers(identifier));
        DailyClaimVHelper.DailyClaimSignals memory signals = dailyClaimVHelpers.decodeDailyClaimSignals(publicSignals);

        // check if proof is used before
        bytes32 nullifier = bytes32(signals.dailyNullifier);
        if (proofNullifier[nullifier]) {
            revert ProofHasUsed();
        }

        proofNullifier[nullifier] = true;

        // check the epoch != current epoch (ppl can only claim in current epoch)
        uint48 epoch = unirep.attesterCurrentEpoch(signals.attesterId);
        if (signals.epoch > epoch) {
            revert InvalidEpoch();
        }

        uint48 dailyEpoch = dailyEpochData.currentEpoch;
        if (signals.dailyEpoch != dailyEpoch) {
            revert InvalidDailyEpoch();
        }

        if (signals.minRep > 0 && signals.proveMinRep) {
            revert NonNegativeReputation();
        }

        verifierHelperManager.verifyProof(publicSignals, proof, identifier);

        // attesting on Unirep contract:
        unirep.attest(
            signals.epochKey,
            epoch,
            posRepFieldIndex, // field index: posRep
            1
        );

        emit ClaimPosRep(signals.epochKey, epoch);
    }

    /**
     * Give the report negative reputation
     * @param publicSignals: public signals
     * @param proof: report non nullifier proof
     * @param change: reputation score
     */
    function claimReportNegRep(
        uint256[] calldata publicSignals,
        uint256[8] calldata proof,
        bytes32 identifier,
        uint256 change
    ) public onlyOwner {
        // check if proof is used before
        bytes32 nullifier = keccak256(abi.encodePacked(publicSignals, proof));
        if (proofNullifier[nullifier]) {
            revert ProofHasUsed();
        }

        proofNullifier[nullifier] = true;

        BaseVerifierHelper.EpochKeySignals memory signals =
            verifierHelperManager.verifyProof(publicSignals, proof, identifier);

        // check the epoch != current epoch (ppl can only claim in current epoch)
        uint48 epoch = unirep.attesterCurrentEpoch(signals.attesterId);
        if (signals.epoch > epoch) {
            revert InvalidEpoch();
        }

        // attesting on Unirep contract:
        // 1. punishing poster   (5)
        // 2. punishing reporter (1)
        unirep.attest(signals.epochKey, epoch, negRepFieldIndex, change);

        emit ClaimNegRep(signals.epochKey, epoch);
    }

    function _updateDailyEpochIfNeeded() public returns (uint48 epoch) {
        epoch = dailyCurrentEpoch();
        uint48 fromEpoch = dailyEpochData.currentEpoch;
        if (epoch == fromEpoch) return epoch;

        emit DailyEpochEnded(epoch - 1);

        dailyEpochData.currentEpoch = epoch;
    }

    function dailyCurrentEpoch() public view returns (uint48) {
        uint48 timestamp = dailyEpochData.startTimestamp;
        uint48 epochLength = dailyEpochData.epochLength;
        return (uint48(block.timestamp) - timestamp) / epochLength;
    }

    function dailyEpochRemainingTime() public view returns (uint48) {
        uint48 timestamp = dailyEpochData.startTimestamp;
        uint48 epochLength = dailyEpochData.epochLength;
        uint48 blockTimestamp = uint48(block.timestamp);
        uint48 _currentEpoch = (blockTimestamp - timestamp) / epochLength;
        return timestamp + (_currentEpoch + 1) * epochLength - blockTimestamp;
    }
}
