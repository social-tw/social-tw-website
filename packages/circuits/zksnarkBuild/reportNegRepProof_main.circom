pragma circom 2.1.0; include "../circuits/reportNegRepProof.circom"; 

component main { public [ reported_epoch_key ] } = ReportNegRepProof(3, 2);