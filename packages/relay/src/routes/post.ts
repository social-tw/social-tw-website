import { DB } from 'anondb/node'
import { ethers } from 'ethers'
import { Express } from 'express'
import UNIREP_APP from '@unirep-app/contracts/artifacts/contracts/UnirepApp.sol/UnirepApp.json'
import { EpochKeyProof } from '@unirep/circuits'
import { Synchronizer } from '@unirep/core'
import { APP_ADDRESS } from '../config'
import TransactionManager from '../singletons/TransactionManager'

export default (app: Express, db: DB, synchronizer: Synchronizer) => {
    app.post('/api/post', async (req, res) => {
        try {
            const { content, publicSignals, proof } = req.body

            // verify epochKeyProof of user
            const epochKeyProof = new EpochKeyProof(
                publicSignals,
                proof,
                synchronizer.prover
            )
            const valid = await epochKeyProof.verify()
            if (!valid) {
                res.status(400).json({ error: 'Invalid proof' })
                return
            }

            // get current epoch and unirep contract
            const epoch = await synchronizer.loadCurrentEpoch()
            const appContract = new ethers.Contract(APP_ADDRESS, UNIREP_APP.abi)

            // post content
            let calldata: any
            if (content) {
                // if the content is not empty, post the content
                calldata = appContract.interface.encodeFunctionData('post', [
                    epochKeyProof.publicSignals,
                    epochKeyProof.proof,
                    ethers.utils.formatBytes32String(content),
                ])
            }

            const hash = await TransactionManager.queueTransaction(
                APP_ADDRESS,
                calldata
            )
            res.json({ hash })
        } catch (error: any) {
            res.status(500).json({ error })
        }
    })
}
