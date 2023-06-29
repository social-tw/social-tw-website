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
            // to make sure user already login 
            if (user == null)
                res.status(500).json({ error: "Please login first" })
            // to avoid double apply
            if (user.status != 0)
                res.status(500).json({ error: "Already registered" })

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
            // make a transaction lil bish
            const appContract = new ethers.Contract(APP_ADDRESS, UNIREP_APP.abi)
            // const contract =
            const calldata = appContract.interface.encodeFunctionData(
                'userSignUp',
                [signupProof.publicSignals, signupProof.proof]
            )
            const hash = await TransactionManager.queueTransaction(
                APP_ADDRESS,
                calldata
            )

            // TODO once finish the transaction 
            //  should update user status to final status in DB or SC

            res.json({ hash })
        } catch (error) {
            res.status(500).json({ error })
        }
    })
}
