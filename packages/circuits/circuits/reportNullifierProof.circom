pragma circom 2.1.8;

include "../../../node_modules/@unirep/circuits/circuits/hasher.circom";

template ReportNullifierProof() {
    signal input report_nullifier; // stored in relay
    signal input hash_user_id;
    signal input report_id;
    signal input current_epoch;
    signal input current_nonce; // action count
    signal input chain_id;
    signal input attester_id;
    signal output current_epoch_key;
    
    /* Step 1: check if the nullifier is equal to the one stored in relayer */ 
    signal nullifier <== Poseidon(2)([hash_user_id, report_id]);
    report_nullifier === nullifier;

    /* Step 2: output with current epoch key */
    current_epoch_key <== EpochKeyHasher()(
        hash_user_id, // identity_secret
        attester_id, 
        current_epoch,
        current_nonce,
        chain_id
    );
}