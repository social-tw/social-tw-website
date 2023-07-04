import { SignupProof } from '@unirep/circuits'
import { ethers } from 'ethers'
import { Express } from 'express'
import { DB } from 'anondb/node'
import { Synchronizer } from '@unirep/core'
import { APP_ADDRESS } from '../config'
import TransactionManager from '../singletons/TransactionManager'
import UNIREP_APP from '@unirep-app/contracts/artifacts/contracts/UnirepApp.sol/UnirepApp.json'

export default (app: Express, db: DB, synchronizer: Synchronizer) => {
    app.post('/api/signup', async (req, res) => {
        try {
            const { publicSignals, proof, hashUserId } = req.body
            
            // todo change to use sc or circuit
            const user = await db.findOne('User', {
                where: { userId: hashUserId }
            })
            
            const signupProof = new SignupProof(
                publicSignals,
                proof,
                synchronizer.prover
            )
            const valid = await signupProof.verify()
            if (!valid) {
                res.status(400).json({ error: 'Invalid proof' })
                return
            }
            const currentEpoch = synchronizer.calcCurrentEpoch()
            if (currentEpoch !== Number(signupProof.epoch)) {
                res.status(400).json({ error: 'Wrong epoch' })
                return
            }

            // userSignUp to unirepApp contract
            const appContract = new ethers.Contract(APP_ADDRESS, UNIREP_APP.abi)
            const calldata = appContract.interface.encodeFunctionData(
                'userSignUp',
                [signupProof.publicSignals, signupProof.proof, hashUserId]
            )
            const transactionHash = await TransactionManager.queueTransaction(
                APP_ADDRESS,
                calldata
            )

            const receipt = await TransactionManager.wait(transactionHash);
            let parsedLogs: (ethers.utils.LogDescription | null)[] = [];
            if (receipt && receipt.logs) {
                parsedLogs = receipt.logs.map((log: ethers.providers.Log) => {
                    try {
                        return appContract.interface.parseLog(log);
                    } catch (e) {
                        return null; // It's not an event from our contract, ignore.
                    }
                }).filter((log: ethers.utils.LogDescription | null) => log !== null);
            }
            console.log(parsedLogs)

            // to make sure user already login 
            if (user == null)
                res.status(500).json({ error: "Please login first" })
            // to avoid double apply
            if (user.status != 0)
                res.status(500).json({ error: "Already registered" })

            res.status(200).json({ status: "success" })
        } catch (error) {
            res.status(500).json({ error })
        }
    })
}
