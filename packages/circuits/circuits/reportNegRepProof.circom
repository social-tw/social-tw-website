pragma circom 2.1.8;

include "../../../node_modules/@unirep/circuits/circuits/hasher.circom";

template ReportNegRepProof(MAX_EPOCH_KEY_NONCE) {
    signal input reported_epoch_key; // (public) stored in relayer
    signal input hash_user_id;
    signal input reported_epoch;
    signal input current_epoch;
    signal input current_nonce;
    signal input chain_id;
    signal input attester_id;
    signal output current_epoch_key;

    signal recovered_epoch_key[3];
    var matched = 0;
    for (var nonce = 0; nonce < MAX_EPOCH_KEY_NONCE; nonce++) {
        // check one of the reported epoch key is matched
        recovered_epoch_key[nonce] <== EpochKeyHasher()(
            hash_user_id,
            attester_id, 
            reported_epoch,
            nonce,
            chain_id    
        );

        if (recovered_epoch_key[nonce] == reported_epoch_key) {
            matched = 1;
        }
    }

    // make sure there at least one recovered_epoch_key matched
    signal result <-- matched;
    result * 1 === 1;

    current_epoch_key <== EpochKeyHasher()(
        hash_user_id, // identity_secret
        attester_id,
        current_epoch,
        current_nonce,
        chain_id
    );
}