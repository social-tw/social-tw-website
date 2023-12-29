import { DB, PostgresConnector, SQLiteConnector } from 'anondb/node.js'
import { ethers } from 'ethers'
import express from 'express'
import fs from 'fs'
import { createServer } from 'http'
// imported libraries
import path from 'path'
import {
    APP_ABI,
    APP_ADDRESS,
    CLIENT_URL,
    DB_PATH,
    GENESIS_BLOCK,
    IS_IN_TEST,
    PRIVATE_KEY,
    provider,
    UNIREP_ADDRESS,
} from './config'
import { postService } from './services/PostService'
import prover from './singletons/prover'
import schema from './singletons/schema'
import { SocketManager } from './singletons/SocketManager'
import TransactionManager from './singletons/TransactionManager'
// libraries
import { UnirepSocialSynchronizer } from './synchornizer'

main().catch((err) => {
    console.error(`Uncaught error: ${err}`)
    process.exit(1)
})

async function main() {
    let db: DB
    if (DB_PATH.startsWith('postgres') && !IS_IN_TEST) {
        db = await PostgresConnector.create(schema, DB_PATH)
    } else db = await SQLiteConnector.create(schema, DB_PATH ?? ':memory:')

    await postService.start(db)

    const synchronizer = new UnirepSocialSynchronizer(
        {
            db: db,
            attesterId: BigInt(APP_ADDRESS),
            prover: prover,
            provider: provider,
            unirepAddress: UNIREP_ADDRESS,
            genesisBlock: parseInt(GENESIS_BLOCK),
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
