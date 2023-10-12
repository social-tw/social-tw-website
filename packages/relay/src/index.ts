// imported libraries
import path from 'path'
import fs from 'fs'
import express from 'express'
import { ethers } from 'ethers'
import { Server, Socket } from 'socket.io'
import { createServer } from "http"
import { SQLiteConnector } from 'anondb/node.js'

// libraries
import { UnirepSocialSynchronizer } from './synchornizer'
import prover from './singletons/prover'
import schema from './singletons/schema'

import {
    provider,
    PRIVATE_KEY,
    UNIREP_ADDRESS,
    DB_PATH,
    APP_ADDRESS,
    APP_ABI,
    CLIENT_URL
} from './config'
import TransactionManager from './singletons/TransactionManager'

main().catch((err) => {
    console.log(`Uncaught error: ${err}`)
    process.exit(1)
})

async function main() {
    const db = await SQLiteConnector.create(schema, DB_PATH ?? ':memory:')

    const synchronizer = new UnirepSocialSynchronizer(
        {
            db: db,
            attesterId: BigInt(APP_ADDRESS),
            prover: prover,
            provider: provider,
            unirepAddress: UNIREP_ADDRESS,
        },
        new ethers.Contract(APP_ADDRESS, APP_ABI, provider)
    )

    await synchronizer.start()

    const { createHelia } = await eval("import('helia')")
    const helia = await createHelia()

    TransactionManager.configure(PRIVATE_KEY, provider, synchronizer.db)
    await TransactionManager.start()

    const app = express()
    const httpServer = createServer(app)

    const io = new Server(httpServer, {
        cors: {
            origin: CLIENT_URL,
            methods: ['GET', 'POST']
        }
    })

    io.on('connection', (socket) => {
        console.log('a user connected')

        socket.on('disconnect', () => {
            console.log('user disconnected')
        })
    })

    const port = process.env.PORT ?? 8000

    // app.listen(port, () => console.log(`Listening on port ${port}`))
    httpServer.listen(port, () => console.log(`Listening on port ${port}`))
    app.use('*', (req, res, next) => {
        res.set('access-control-allow-origin', '*')
        res.set('access-control-allow-headers', '*')
        next()
    })
    app.use(express.json())
    app.use('/build', express.static(path.join(__dirname, '../keys')))

    // import all non-index files from this folder
    const routeDir = path.join(__dirname, 'routes')
    const routes = await fs.promises.readdir(routeDir)
    for (const routeFile of routes) {
        const { default: route } = await import(path.join(routeDir, routeFile))
        route(app, db, synchronizer, helia)
    }
}
