pragma circom 2.1.8;

include "../../../node_modules/@unirep/circuits/circuits/incrementalMerkleTree.circom";
include "../../../node_modules/@unirep/circuits/circuits/hasher.circom";

template ReportIdentityProof(STATE_TREE_DEPTH, FIELD_COUNT) {
    // inputs
    signal input report_nullifier;
    signal input identity_secret;
    signal input report_id;
    signal input data[FIELD_COUNT];
    signal input attester_id;
    signal input from_epoch;
    signal input chain_id;
    signal input state_tree_indices[STATE_TREE_DEPTH];
    signal input state_tree_elements[STATE_TREE_DEPTH];
    signal input state_tree_root;
    
    /* Step 1. Check if user exists in the state tree */
    signal leaf_hasher;
    (leaf_hasher, _, _) <== StateTreeLeaf(FIELD_COUNT)(
        data,
        identity_secret,
        attester_id,
        from_epoch,
        chain_id
    );

    signal state_merkletree_root <== MerkleTreeInclusionProof(STATE_TREE_DEPTH)(
        leaf_hasher,
        state_tree_indices,
        state_tree_elements
    );

    state_tree_root === state_merkletree_root;

    /* Step 2: check nullifier */
    signal nullifier <== Poseidon(2)([identity_secret, report_id]);
    nullifier === report_nullifier;
}