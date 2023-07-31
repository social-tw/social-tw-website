import { SignupProof } from '@unirep/circuits'
import { BigNumberish } from 'ethers'
import { Express } from 'express'
import { DB } from 'anondb/node'
import { Synchronizer } from '@unirep/core'
import { APP_ADDRESS } from '../config'
import TransactionManager from '../singletons/TransactionManager'
import { SnarkProof } from '@unirep/utils'
import { UserRegisterStatus } from '../enums/userRegisterStatus'

async function signup(
    publicSignals: BigNumberish[],
    proof: SnarkProof,
    hashUserId: String,
    synchronizer: Synchronizer
) {
    const signupProof = new SignupProof(
        publicSignals,
        proof,
        synchronizer.prover
    )
    const valid = await signupProof.verify()
    if (!valid) {
        throw new Error('Invalid proof')
    }
    const currentEpoch = synchronizer.calcCurrentEpoch()
    if (currentEpoch !== Number(signupProof.epoch)) {
        throw new Error('Wrong epoch')
    }
    const appContract = TransactionManager.appContract!!
    const calldata = appContract.interface.encodeFunctionData('userSignUp', [
        signupProof.publicSignals,
        signupProof.proof,
        hashUserId,
    ])

    const parsedLogs = await TransactionManager.executeTransaction(
        appContract,
        APP_ADDRESS,
        calldata
    )
    console.log(parsedLogs)
}

export default (app: Express, db: DB, synchronizer: Synchronizer) => {
    app.get('/api/identity', async (req, res) => {
        const { hashUserId } = req.body

        try {
            var statusCode =
                await TransactionManager.appContract!!.queryUserStatus(
                    hashUserId
                )
            if (parseInt(statusCode) != UserRegisterStatus.INIT) {
                res.status(400).json({ error: 'Invalid status' })
            }

            const wallet = TransactionManager.wallet!!
            const signMsg = await wallet.signMessage(hashUserId)
            res.status(200).json({ signMsg: signMsg })
        } catch (error) {
            res.status(500).json({ error })
        }
    })

    app.post('/api/signup', async (req, res) => {
        try {
            const { publicSignals, proof, hashUserId } = req.body
            await signup(publicSignals, proof, hashUserId, synchronizer)

            res.status(200).json({ status: 'success' })
        } catch (error) {
            res.status(500).json({ error })
        }
    })
}
