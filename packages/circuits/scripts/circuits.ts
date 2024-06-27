import { CircuitConfig } from '@unirep/circuits'
const { STATE_TREE_DEPTH, FIELD_COUNT, SUM_FIELD_COUNT, REPL_NONCE_BITS } =
    CircuitConfig.default
const MAX_EPOCH_KEY_NONCE = 3

export const ptauName = 'powersOfTau28_hez_final_18.ptau'

export const circuitContents = {
    dataProof: `pragma circom 2.1.0; include "../circuits/dataProof.circom"; \n\ncomponent main { public [ value ] } = DataProof(${STATE_TREE_DEPTH}, ${FIELD_COUNT}, ${SUM_FIELD_COUNT}, ${REPL_NONCE_BITS});`,
    reportNullifierProof: `pragma circom 2.1.0; include "../circuits/reportNullifierProof.circom"; \n\ncomponent main { public [ report_nullifier ] } = ReportNullifierProof();`,
    reportNegRepProof: `pragma circom 2.1.0; include "../circuits/reportNegRepProof.circom"; \n\ncomponent main { public [ reported_epoch_key ] } = ReportNegRepProof(${MAX_EPOCH_KEY_NONCE});`,
}
