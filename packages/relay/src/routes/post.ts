import { DB } from 'anondb/node'
import { ethers } from 'ethers'
import { Express } from 'express'
import UNIREP_APP from '@unirep-app/contracts/artifacts/contracts/UnirepApp.sol/UnirepApp.json'
import { EpochKeyProof } from '@unirep/circuits'
import { Synchronizer } from '@unirep/core'
import { APP_ADDRESS } from '../config'
import { errorHandler } from '../middleware'
import TransactionManager from '../singletons/TransactionManager'
import {dynamicImport} from 'tsimportlib';

export const LOAD_POST_COUNT = 10

export default (app: Express, db: DB, synchronizer: Synchronizer) => {
    app.get(
        '/api/post',
        errorHandler(async (req, res, next) => {
            await fetchPosts(req, res, db)
        })
    )

    app.post(
        '/api/post',
        errorHandler(async (req, res, next) => {
            await createPost(req, res, db, synchronizer)
        })
    )
}

async function fetchPosts(req, res, db: DB) {
    try {
        console.log('check')
        const post = await db.findMany('Post', {
            where: {},
        })
        console.log(post)
        res.json(post)
        return

        if (req.query.query === undefined) {
            const posts = await db.findMany('Post', {
                where: {
                    status: 0,
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

async function createPost(req, res, db: DB, synchronizer: Synchronizer) {
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

            // dynamic import ipfs client
            const { create} = await dynamicImport('kubo-rpc-client', module) as typeof import('kubo-rpc-client');
            // Create ipfs client to connect to kubo ipfs node
            const client = await create();
            const IPFSContent = {
                content: content
            }
            const file = await client.add(JSON.stringify(IPFSContent))
            cid = file.cid.toString()


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
