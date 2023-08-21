import { DB } from 'anondb/node'
import { ethers } from 'ethers'
import { Express } from 'express'
import UNIREP_APP from '@unirep-app/contracts/artifacts/contracts/UnirepApp.sol/UnirepApp.json'
import { EpochKeyProof } from '@unirep/circuits'
import { APP_ADDRESS } from '../config'
import { errorHandler } from '../middleware'
import TransactionManager from '../singletons/TransactionManager'
import { dynamicImport } from 'tsimportlib'
import { UnirepSocialSynchronizer } from '../synchornizer'
import type { Helia } from '@helia/interface'


export const LOAD_POST_COUNT = 10

export default (
    app: Express,
    db: DB,
    synchronizer: UnirepSocialSynchronizer,
    helia: Helia,
) => {
    app.get(
        '/api/post',
        errorHandler(async (req, res, next) => {
            await fetchPosts(req, res, db)
        })
    )

    app.post(
        '/api/post',
        errorHandler(async (req, res, next) => {
            await createPost(req, res, db, synchronizer, helia)
        })
    )
}

async function fetchPosts(req, res, db: DB) {
    try {
        if (req.query.query === undefined) {
            const posts = await db.findMany('Post', {
                where: {
                    status: 1,
                },
            })
            res.json(posts)
            return
        }

        const epks = req.query.epks ? req.query.epks.split('_') : undefined

        const posts = await db.findMany('Post', {
            where: {
                epochKey: epks,
            },
        })

        res.json(posts.slice(0, Math.min(LOAD_POST_COUNT, posts.length)))
    } catch (error: any) {
        res.status(500).json({ error })
    }
}

async function createPost(
    req,
    res,
    db: DB,
    synchronizer: UnirepSocialSynchronizer,
    helia: Helia
) {
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
        let cid: any
        if (content) {
            // if the content is not empty, post the content
            calldata = appContract.interface.encodeFunctionData('post', [
                epochKeyProof.publicSignals,
                epochKeyProof.proof,
                content,
            ])

            // store content into helia ipfs node with json plain
            const { json } =  await eval("import('@helia/json')")
            const heliaJson = json(helia)
            const IPFSContent = {
                content: content,
            }
            let file = await heliaJson.add(JSON.stringify(IPFSContent))
            cid = file.toString()
        }

        const hash = await TransactionManager.queueTransaction(
            APP_ADDRESS,
            calldata
        )

        const post = await db.create('Post', {
            content,
            cid,
            epochKey: epochKeyProof.epochKey,
            epoch: epoch,
            transactionHash: hash,
            status: 0,
        })

        res.json({
            transaction: hash,
            currentEpoch: epoch,
            post,
        })
    } catch (error: any) {
        console.log(error)
        res.status(500).json({ error })
    }
}
