import { ethers } from 'hardhat'
import path from 'path'
import fs from 'fs'
import express from 'express'
import { SQLiteConnector } from 'anondb/node.js'
import { deployApp } from '@unirep-app/contracts/scripts/utils'

// libraries
import { UnirepSocialSynchronizer } from '../src/synchornizer'
import prover from '../src/singletons/prover'
import schema from '../src/singletons/schema'
import TransactionManager from '../src/singletons/TransactionManager'

import { PRIVATE_KEY } from '../src/config'
import { createServer } from 'http'
import { SocketManager } from '../src/singletons/SocketManager'

__dirname = path.join(__dirname, '..', 'src')

export const deployContracts = async (epochLength: number) => {
    const [signer] = await ethers.getSigners()
    return await deployApp(signer, epochLength)
}

let socketManager: SocketManager

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

    const app = express()
    app.use('*', (req, res, next) => {
        res.set('access-control-allow-origin', '*')
        res.set('access-control-allow-headers', '*')
        next()
    })
    const port = process.env.PORT ?? 8000
    const server = app.listen(port, () =>
        console.log(`Listening on port ${port}`)
    )

    console.log('Starting socket manager...')
    const httpServer = createServer(app)
    socketManager = new SocketManager(httpServer)
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
        server,
        socketManager,
    }
}
