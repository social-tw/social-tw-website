import { ethers } from 'hardhat'
import path from 'path'
import fs from 'fs'
import express from 'express'
import { SQLiteConnector } from 'anondb/node.js'
import { deployApp } from '@unirep-app/contracts/scripts/utils'

// libraries
import { UnirepSocialSynchronizer } from '../src/services/singletons/UnirepSocialSynchronizer'
import prover from '../src/services/singletons/prover'
import schema from '../src/db/schema'
import TransactionManager from '../src/services/singletons/TransactionManager'
import http from 'http'
import { PRIVATE_KEY } from '../src/config'
import {
    SocketManager,
    socketManager,
} from '../src/services/singletons/SocketManager'
import { postService } from '../src/services/PostService'
import { Synchronizer } from '@unirep/core'

import chaiHttp from 'chai-http'
import chai from 'chai'
import * as chaiAsPromise from 'chai-as-promised'

__dirname = path.join(__dirname, '..', 'src')

export const deployContracts = async (epochLength: number) => {
    const [signer] = await ethers.getSigners()
    return await deployApp(signer, epochLength)
}

export const startServer = async (unirep: any, unirepApp: any) => {
    const db = await SQLiteConnector.create(schema, ':memory:')

    const provider = ethers.provider

    const synchronizer = new UnirepSocialSynchronizer(
        {
            db: db,
            attesterId: BigInt(unirepApp.address),
            prover: prover,
            provider: provider,
            unirepAddress: unirep.address,
        },
        unirepApp
    )
    synchronizer.resetDatabase()

    console.log('Starting synchronizer...')
    await synchronizer.start()
    console.log('Synchronizer started')

    console.log('Starting Helia ipfs node...')
    const { createHelia } = await eval("import('helia')")
    const helia = await createHelia()
    console.log('Helia ipfs node started')

    console.log('Starting transaction manager...')
    TransactionManager.configure(PRIVATE_KEY, provider, synchronizer.db)
    await TransactionManager.start()
    console.log('Transaction manager started')

    // open the chai testing server
    const app = express()
    chai.use(chaiHttp)
    chai.use(chaiAsPromise.default)
    const server = http.createServer(app)
    const chaiServer = chai.request(server).keepOpen()

    app.use('*', (req, res, next) => {
        res.set('access-control-allow-origin', '*')
        res.set('access-control-allow-headers', '*')
        next()
    })

    console.log('Starting socket manager...')
    new SocketManager(server)
    console.log('Socket manager started')

    app.use(express.json())
    app.use('/build', express.static(path.join(__dirname, '../keys')))

    // import all non-index files from this folder
    const routeDir = path.join(__dirname, 'routes')
    const routes = await fs.promises.readdir(routeDir)
    for (const routeFile of routes) {
        const { default: route } = await import(path.join(routeDir, routeFile))
        route(app, synchronizer.db, synchronizer, helia)
    }

    return {
        db,
        prover,
        provider,
        TransactionManager,
        synchronizer,
        chaiServer,
        postService,
        socketManager,
    }
}

export const stopServer = async (
    testName: string,
    snapshot: any,
    sync: Synchronizer,
    server: ChaiHttp.Agent
) => {
    console.log(`server ${testName} is shutting down`)
    await ethers.provider.send('evm_revert', [snapshot])
    sync.stop()
    socketManager.close()
    server.close((_) => {
        console.log('server closed', testName)
    })
}
