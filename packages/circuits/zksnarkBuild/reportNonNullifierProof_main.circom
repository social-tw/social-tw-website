pragma circom 2.1.0; include "../circuits/reportNonNullifierProof.circom"; 

component main { public [ reported_epoch_key ] } = ReportNonNullifierProof(3);