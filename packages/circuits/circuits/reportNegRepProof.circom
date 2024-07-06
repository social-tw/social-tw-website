pragma circom 2.1.8;

include "../../../node_modules/@unirep/circuits/circuits/epochKeyLite.circom";

template ReportNegRepProof(MAX_EPOCH_KEY_NONCE, TYPE_LIMIT) {
    // inputs
    signal input reported_epoch_key; // (public) stored in relayer
    signal input hash_user_id;
    signal input reported_epoch;
    signal input current_epoch;
    signal input current_nonce;
    signal input chain_id;
    signal input attester_id;
    
    // type 0: poster get punished   (-5)
    // type 1: reporter get punished (-1)
    signal input type;

    /* Step 0: check 0 <= type < TYPE_LIMIT */
    signal x <-- type < TYPE_LIMIT ? 1 : 0;
    signal y <-- type >= 0 ? 1 : 0;
    x * 1 === 1;
    y * 1 === 1;

    // outputs
    signal output current_epoch_key;
    signal output control;

    var reveal_nonce = 0;
    var sig_data = 1;

    /* Step 1: traverse 0~MAX_EPOCH_KEY_NONCE and check epochkey */
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

    /* Step 2: make sure there at least one recovered_epoch_key matched */
    signal result <-- type == 1 ? 1 : matched;
    result * 1 === 1;


    /* Step 3: output publicSignals with data and epochKey */ 
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