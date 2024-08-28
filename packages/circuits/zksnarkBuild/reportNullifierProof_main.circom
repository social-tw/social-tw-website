pragma circom 2.1.0; include "../circuits/reportNullifierProof.circom"; 

component main { public [ report_nullifier, report_id ] } = ReportNullifierProof(3);