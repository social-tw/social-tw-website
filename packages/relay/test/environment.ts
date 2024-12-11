import { deployApp } from '@unirep-app/contracts/scripts/utils/deployUnirepSocialTw'
import { SQLiteConnector } from 'anondb/node.js'
import express from 'express'
import fs from 'fs'
import { ethers } from 'hardhat'
import path from 'path'

// libraries
import http from 'http'
import { PRIVATE_KEY } from '../src/config'
import schema from '../src/db/schema'
import { UnirepSocialSynchronizer } from '../src/services/singletons/UnirepSocialSynchronizer'
import prover from '../src/services/utils/Prover'
import {
    SocketManager,
    socketManager,
} from '../src/services/utils/SocketManager'
import TransactionManager from '../src/services/utils/TransactionManager'

import { Helia } from '@helia/interface'
import { Synchronizer } from '@unirep/core'
import chai from 'chai'
import * as chaiAsPromise from 'chai-as-promised'
import chaiHttp from 'chai-http'

__dirname = path.join(__dirname, '..', 'src')

export const deployContracts = async (epochLength: number) => {
    const [signer] = await ethers.getSigners()
    return await deployApp(signer, epochLength)
}

let helia: Helia

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
    helia = await createHelia()
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

    console.log('Starting socket manager...')
    new SocketManager(server)
    console.log('Socket manager started')

    app.use(express.json())

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
    sync.stop()
    socketManager.close()
    server.close((_) => {
        console.log('server closed', testName)
    })
    await helia.stop()
    await ethers.provider.send('evm_revert', [snapshot])
}
