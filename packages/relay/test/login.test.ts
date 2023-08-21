import * as crypto from 'crypto'
import fetch from 'node-fetch'
import { ethers } from 'hardhat'
import { expect } from 'chai'
import { Identity } from '@semaphore-protocol/identity'
import { UserState } from '@unirep/core'
import { stringifyBigInts } from '@unirep/utils'

import { HTTP_SERVER } from './configs'
import { deployContracts, startServer } from './environment'

let userState: UserState

describe('LOGIN /login', () => {
    let unirep, app;
    let db, prover, provider, TransactionManager;
    beforeEach(async () => {
        // deploy contracts
        ({ unirep, app } = await deployContracts());
        // start server
        ({ db, prover, provider, TransactionManager } = await startServer(
            unirep,
            app
        ));
    })

    it('/api/login should response 200', async () => {
        const response = (await fetch(`${HTTP_SERVER}/api/login`, {
            method: 'GET',
        }))
        console.log(response)
        expect(response.status).equal(200)
    })

    it('should login successfully', async () => {
        
    })

    // TODO
    //it('should post failed with wrong proof', async () => {})
})
