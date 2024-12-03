import { CircuitConfig } from '@unirep/circuits'
const {
    STATE_TREE_DEPTH,
    FIELD_COUNT,
    SUM_FIELD_COUNT,
    REPL_NONCE_BITS,
    NUM_EPOCH_KEY_NONCE_PER_EPOCH,
} = CircuitConfig.default

export const ptauName = 'powersOfTau28_hez_final_18.ptau'

export const circuitContents = {
    dataProof: `pragma circom 2.1.0; include "../circuits/dataProof.circom"; \n\ncomponent main { public [ value ] } = DataProof(${STATE_TREE_DEPTH}, ${FIELD_COUNT}, ${SUM_FIELD_COUNT}, ${REPL_NONCE_BITS});`,
    reportNullifierProof: `pragma circom 2.1.0; include "../circuits/reportNullifierProof.circom"; \n\ncomponent main { public [ report_nullifier, report_id ] } = ReportNullifierProof(${NUM_EPOCH_KEY_NONCE_PER_EPOCH});`,
    reportNonNullifierProof: `pragma circom 2.1.0; include "../circuits/reportNonNullifierProof.circom"; \n\ncomponent main { public [ reported_epoch_key ] } = ReportNonNullifierProof(${NUM_EPOCH_KEY_NONCE_PER_EPOCH});`,
    reportIdentityProof: `pragma circom 2.1.0; include "../circuits/reportIdentityProof.circom"; \n\ncomponent main { public [ report_nullifier, report_id, attester_id, from_epoch, state_tree_root ] } = ReportIdentityProof(${STATE_TREE_DEPTH}, ${FIELD_COUNT});`,
    dailyClaimProof: `pragma circom 2.1.0; include "../circuits/dailyClaimProof.circom"; \n\ncomponent main { public [ daily_nullifier ] } = DailyClaimProof(${STATE_TREE_DEPTH}, ${NUM_EPOCH_KEY_NONCE_PER_EPOCH}, ${SUM_FIELD_COUNT}, ${FIELD_COUNT}, ${REPL_NONCE_BITS});`,
}
