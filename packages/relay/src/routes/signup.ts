import { SignupProof } from '@unirep/circuits'
import { Express } from 'express'
import { DB } from 'anondb/node'
import { APP_ADDRESS } from '../config'
import TransactionManager from '../singletons/TransactionManager'
import { SnarkProof } from '@unirep/utils'
import { UserRegisterStatus } from '../enums/userRegisterStatus'
import { UnirepSocialSynchronizer } from '../synchornizer'

async function signup(
    publicSignals: string[],
    proof: SnarkProof,
    hashUserId: String,
    fromServer: boolean,
    synchronizer: UnirepSocialSynchronizer
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
        fromServer,
    ])

    // TODO: fix transction twice bug
    const hash = await TransactionManager.queueTransaction(
        APP_ADDRESS,
        calldata
    )

    const parsedLogs = await TransactionManager.executeTransaction(
        appContract,
        APP_ADDRESS,
        calldata
    )

    console.log(parsedLogs)

    return hash
}

export default (
    app: Express,
    db: DB,
    synchronizer: UnirepSocialSynchronizer
) => {
    app.post('/api/identity', async (req, res) => {
        const { hashUserId } = req.body
        console.log(hashUserId)
        try {
            const statusCode =
                await TransactionManager.appContract!!.queryUserStatus(
                    hashUserId!!
                )
            console.log(statusCode)
            if (parseInt(statusCode) != UserRegisterStatus.INIT) {
                throw new Error('Invalid status')
            }

            const wallet = TransactionManager.wallet!!
            const signMsg = await wallet.signMessage(hashUserId!!.toString())
            res.status(200).json({ signMsg: signMsg })
        } catch (error) {
            console.error('/api/identity\n', error)
            res.status(500).json({ error })
        }
    })

    app.post('/api/signup', async (req, res) => {
        try {
            const { publicSignals, proof, hashUserId, fromServer } = req.body
            const hash = await signup(
                publicSignals,
                proof,
                hashUserId,
                fromServer,
                synchronizer
            )

            res.status(200).json({ status: 'success', hash: hash })
        } catch (error) {
            if (
                error instanceof Error &&
                error.message.includes('UserAlreadySignedUp')
            ) {
                res.status(400).json({ error: 'User already signed up!' })
            } else {
                res.status(500).json({ error: 'Internal server error' })
            }
        }
    })
}