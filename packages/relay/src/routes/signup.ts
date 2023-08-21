import { Express } from 'express'
import { DB } from 'anondb/node'
import TransactionManager from '../singletons/TransactionManager'
import { UserRegisterStatus } from '../enums/userRegisterStatus'
import { UnirepSocialSynchronizer } from '../synchornizer'
import { userService } from '../services/UserService'

export default (
    app: Express,
    db: DB,
    synchronizer: UnirepSocialSynchronizer
) => {
    app.post('/api/identity', async (req, res) => {
        const { hashUserId } = req.body
        try {
            const statusCode =
                await TransactionManager.appContract!!.queryUserStatus(
                    hashUserId!!
                )
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
            const hash = await userService.signup(
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
