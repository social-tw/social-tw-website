pragma circom 2.1.0; include "../circuits/dailyClaimProof.circom"; 

component main { public [ daily_nullifier, daily_epoch, epoch, attester_id ] } = DailyClaimProof(17, 3, 4, 6, 48);