pragma circom 2.1.0; include "../circuits/reportNullifierProof.circom"; 

component main { public [ report_nullifier ] } = ReportNullifierProof(3);