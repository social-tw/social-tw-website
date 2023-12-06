// imported libraries
import path from 'path'
import fs from 'fs'
import express from 'express'
import { ethers } from 'ethers'
import { SQLiteConnector, PostgresConnector } from 'anondb/node.js'
import { createServer } from 'http'

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
    IS_IN_TEST,
    CLIENT_URL,
} from './config'
import TransactionManager from './singletons/TransactionManager'
import { SocketManager } from './singletons/SocketManager'

main().catch((err) => {
    console.log(`Uncaught error: ${err}`)
    process.exit(1)
})

async function main() {
    var db
    if (DB_PATH.startsWith('postgres') && !IS_IN_TEST) {
        db = await PostgresConnector.create(schema, DB_PATH)
    } else db = await SQLiteConnector.create(schema, DB_PATH ?? ':memory:')

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

    // reset all data if reset flag is true and evn is not production
    await synchronizer.resetDatabase()
    await synchronizer.start()

    const { createHelia } = await eval("import('helia')")
    const helia = await createHelia()

    TransactionManager.configure(PRIVATE_KEY, provider, synchronizer.db)
    await TransactionManager.start()

    const app = express()

    // setting cors
    app.use((req, res, next) => {
        res.set('access-control-allow-origin', CLIENT_URL)
        res.set('access-control-allow-headers', '*')
        res.set('access-control-allow-methods', 'GET, POST, PUT, DELETE, OPTIONS')
        next()
    })

    const httpServer = createServer(app)
    new SocketManager(httpServer)
    const port = process.env.PORT ?? 8000

    app.use(express.json())
    app.use('/build', express.static(path.join(__dirname, '../keys')))

    httpServer.listen(port, () => console.log(`Listening on port ${port}`))

    // import all non-index files from this folder
    const routeDir = path.join(__dirname, 'routes')
    const routes = await fs.promises.readdir(routeDir)
    for (const routeFile of routes) {
        const { default: route } = await import(path.join(routeDir, routeFile))
        route(app, db, synchronizer, helia)
    }
}
