import { SignupProof } from '@unirep/circuits'
import { BigNumberish, ethers } from 'ethers'
import { Express } from 'express'
import { DB } from 'anondb/node'
import { Synchronizer } from '@unirep/core'
import { provider, PRIVATE_KEY, APP_ADDRESS } from '../config'
import TransactionManager from '../singletons/TransactionManager'
import { Identity } from '@semaphore-protocol/identity'
import { UserState } from '@unirep/core'
import { SnarkProof } from '@unirep/utils';
import { UserRegisterStatus } from '../enums/userRegisterStatus'
import prover from '../singletons/prover'

async function signup (publicSignals: BigNumberish[], proof: SnarkProof, hashUserId: String, synchronizer: Synchronizer) {

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
    const calldata = appContract.interface.encodeFunctionData(
        'userSignUp',
        [signupProof.publicSignals, signupProof.proof, hashUserId]
    )

    const parsedLogs = await TransactionManager.executeTransaction(appContract, APP_ADDRESS, calldata);
    console.log(parsedLogs)
}


export default (app: Express, db: DB, synchronizer: Synchronizer) => {

    app.get('/api/server/signup', async (req, res) => {
        const { hashUserId } = req.body

        try {
            var statusCode = await TransactionManager.appContract!!.queryUserStatus(hashUserId)
            if (parseInt(statusCode) != UserRegisterStatus.NOT_REGISTER) {
                res.status(400).json({ error: 'Invalid status' })
            }

            const wallet = new ethers.Wallet(PRIVATE_KEY, provider)
            const signMsg = await wallet.signMessage(hashUserId)
            const identity = new Identity(signMsg)
            const userState = new UserState(
                {
                    provider,
                    prover,
                    unirepAddress: APP_ADDRESS,
                    attesterId: BigInt(APP_ADDRESS),
                    _id: identity,
                },
                identity
            )
            
            const signupProof = await userState.genUserSignUpProof()
            await signup(signupProof.publicSignals, signupProof._snarkProof, hashUserId, synchronizer)
            res.status(200).json({ status: "success" })
        } catch (error) {
            res.status(500).json({ error })
        }

    })

    app.post('/api/signup', async (req, res) => {
        try {
            const { publicSignals, proof, hashUserId } = req.body
            await signup(publicSignals, proof, hashUserId, synchronizer)

            res.status(200).json({ status: "success" })
        } catch (error) {
            res.status(500).json({ error })
        }
    })
}
