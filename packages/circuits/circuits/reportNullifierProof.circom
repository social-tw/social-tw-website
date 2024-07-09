pragma circom 2.1.8;

include "../../../node_modules/@unirep/circuits/circuits/epochKeyLite.circom";

template ReportNullifierProof(MAX_EPOCH_KEY_NONCE) {
    // inputs
    signal input report_nullifier; // stored in relay
    signal input hash_user_id;
    signal input report_id;
    signal input current_epoch;
    signal input current_nonce; // action count
    signal input chain_id;
    signal input attester_id;
    
    // outputs
    signal output current_epoch_key;
    signal output control;

    var reveal_nonce = 0;
    var sig_data = 1;

    /* Step 1: check if the nullifier is equal to the one stored in relayer */ 
    signal nullifier <== Poseidon(2)([hash_user_id, report_id]);
    report_nullifier === nullifier;

    /* Step 2: output publicSignals with data and current epoch key */
    (control, current_epoch_key) <== EpochKeyLite
    (MAX_EPOCH_KEY_NONCE) (
        hash_user_id,
        reveal_nonce,
        attester_id,
        current_epoch,
        current_nonce,
        sig_data,
        chain_id
    );
}