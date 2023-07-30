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
    Unirep public unirep;
    IVerifier internal dataVerifier;

    uint16 public constant NOT_REGISTER = 0;
    uint16 public constant INIT = 1;
    uint16 public constant REGISTERED = 2;
    uint16 public constant REGISTERED_SERVER = 3;
    
    uint256 initTimeRange = 300000; // default is 5 min
    uint160 attesterId;

    // store all users
    mapping(uint256 => uint16) userRegistry;
    mapping(uint256 => uint256) userInitExpiryMap;
    
    event UserSignUpSuccess(uint256 hashUserId);

    // error 
    error UserAlreadySignedUp(uint256 hashUserId, uint16 status);
    error AttesterIdNotMatch(uint160 attesterId);
    error UserInitStatusInvalid(uint256 hashUserId);
    error UserInitExpiry(uint256 hashUserId);

    constructor(Unirep _unirep, IVerifier _dataVerifier, uint48 _epochLength) {
        // set unirep address
        unirep = _unirep;

        // set verifier address
        dataVerifier = _dataVerifier;

        // sign up as an attester
        attesterId = uint160(msg.sender);
        unirep.attesterSignUp(_epochLength);
    }

    // for query current user status
    function queryUserStatus(uint256 hashUserId) view external returns (uint16) {
        // TODO this checking is required?
        if (uint256(uint160(msg.sender)) != attesterId) {
            revert AttesterIdNotMatch(uint160(msg.sender));
        }

        return userRegistry[hashUserId];
    }

    // for init the user status after login
    function initUserStatus(uint256 hashUserId) external returns (uint16) {
        if (uint256(uint160(msg.sender)) != attesterId) {
            revert AttesterIdNotMatch(uint160(msg.sender));
        }

        if (userRegistry[hashUserId] > INIT) {
            revert UserInitStatusInvalid(hashUserId);
        }
        
        userInitExpiryMap[hashUserId] = block.timestamp + initTimeRange;
        userRegistry[hashUserId] = INIT;
        return userRegistry[hashUserId];
    }

    // sign up users in this app
    function userSignUp(
        uint256[] memory publicSignals,
        uint256[8] memory proof,
        uint256 hashUserId
    ) public {
        if (userRegistry[hashUserId] > INIT) {
            revert UserAlreadySignedUp(hashUserId, userRegistry[hashUserId]);
        }

        if (userRegistry[hashUserId] != INIT) {
            revert UserInitStatusInvalid(hashUserId);
        }

        // revert when init is expiry 
        if (userInitExpiryMap[hashUserId] > 0 
            && userInitExpiryMap[hashUserId] < block.timestamp) {
            revert UserInitExpiry(hashUserId);
        }

        userRegistry[hashUserId] = REGISTERED;
        unirep.userSignUp(publicSignals, proof);
        emit UserSignUpSuccess(hashUserId);
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
