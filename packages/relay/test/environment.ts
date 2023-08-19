//import url from 'url'
import { ethers } from 'hardhat'
import path from 'path'
import fs from 'fs'
import express from 'express'
import { SQLiteConnector } from 'anondb/node.js'
import { deployUnirep } from '@unirep/contracts/deploy/index.js'

// libraries
import { UnirepSocialSynchronizer } from '../src/synchornizer'
import prover from '../src/singletons/prover'
import schema from '../src/singletons/schema'
import TransactionManager from '../src/singletons/TransactionManager'

import { epochLength } from './configs'
import { PRIVATE_KEY } from '../src/config'

__dirname = path.join(__dirname, '..', 'src')

export const deployContracts = async () => {
    const [signer] = await ethers.getSigners()
    const unirep = await deployUnirep(signer)
    const verifierF = await ethers.getContractFactory('DataProofVerifier')
    const verifier = await verifierF.deploy()
    await verifier.deployed()
    const App = await ethers.getContractFactory('UnirepApp')
    const app = await App.deploy(unirep.address, verifier.address, epochLength)

    await app.deployed()

    console.log(
        `Unirep app with epoch length ${epochLength} is deployed to ${app.address}`
    )

    return { unirep, app }
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

    console.log('Starting synchronizer...')
    await synchronizer.start()
    console.log('Synchronizer started')

    console.log('Starting transaction manager...')
    TransactionManager.configure(PRIVATE_KEY, provider, synchronizer._db)
    await TransactionManager.start()
    console.log('Transaction manager started')

    const app = express()
    const port = process.env.PORT ?? 8000
    app.listen(port, () => console.log(`Listening on port ${port}`))
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
        route(app, synchronizer._db, synchronizer)
    }
    return {
        prover,
        provider,
    }
}
