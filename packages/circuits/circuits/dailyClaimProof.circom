pragma circom 2.1.0;

include "../../../node_modules/@unirep/circuits/circuits/circomlib/circuits/comparators.circom";
include "../../../node_modules/@unirep/circuits/circuits/reputation.circom";

template DailyClaimProof(STATE_TREE_DEPTH, EPOCH_KEY_NONCE_PER_EPOCH, SUM_FIELD_COUNT, FIELD_COUNT, REPL_NONCE_BITS) {
    // Identity and daily epoch
    signal input identity_secret;
    signal input daily_epoch; // should be changed daily
    signal input daily_nullifier; 

    // Global state tree
    signal input state_tree_indices[STATE_TREE_DEPTH];
    signal input state_tree_elements[STATE_TREE_DEPTH];
    signal input data[FIELD_COUNT];

    // Graffiti
    signal input prove_graffiti;
    signal input graffiti; // public

    // Epoch key
    signal input reveal_nonce;
    signal input attester_id;
    signal input epoch;
    signal input nonce;
    signal input chain_id;
    signal input sig_data;

    // Reputation proof parameters
    signal input min_rep;
    signal input max_rep;
    signal input prove_min_rep;
    signal input prove_max_rep;
    signal input prove_zero_rep;

    var REP_BITS = 64;

    // Step 1. Check reputation circuit and Check reputation < 0
    (_, _, _) <== Reputation(STATE_TREE_DEPTH, EPOCH_KEY_NONCE_PER_EPOCH, SUM_FIELD_COUNT, FIELD_COUNT, REPL_NONCE_BITS)(
        identity_secret,
        state_tree_indices,
        state_tree_elements,
        data,
        prove_graffiti,
        graffiti,
        reveal_nonce,
        attester_id,
        epoch,
        nonce,
        chain_id,
        min_rep,
        max_rep,
        prove_min_rep,
        prove_max_rep,
        prove_zero_rep,
        sig_data
    );

    signal max_rep_check <== GreaterThan(REP_BITS)([max_rep, min_rep]);
    max_rep_check === 1;

    // Step 2: check daily nullifier
    signal cal_daily_nullifier <== Poseidon(2)([identity_secret, daily_epoch]);
    daily_nullifier === cal_daily_nullifier;
}