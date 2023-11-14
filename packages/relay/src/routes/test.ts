import { Express } from 'express'
import { UNIREP_ADDRESS, APP_ADDRESS, ETH_PROVIDER_URL } from '../config'
//import { create } from 'kubo-rpc-client'
import { dynamicImport } from 'tsimportlib'
import { CID } from 'kubo-rpc-client'
//import { concat as uint8ArrayConcat } from 'uint8arrays/concat'
//import all from 'it-all'

export default (app: Express) => {
    app.get('/api/config2', async (_, res) => {
        //const create = await import('kubo-rpc-client');
        //const { create } = await import('ipfs-http-client');
        const { create, CID } = (await dynamicImport(
            'kubo-rpc-client',
            module,
        )) as typeof import('kubo-rpc-client')
        //const { concat } = await dynamicImport('uint8arrays/concat', module) as typeof import('uint8arrays/concat');
        //const  all  = await dynamicImport('it-all', module) as typeof import('it-all');
        //const client = await create.default
        const client = await create()
        const ans = {
            name: 'Brian',
            age: 40,
        }
        //const file = new File([ JSON.stringify(ans) ], 'file.json', { type: 'application/json' });
        //console.log(file)
        //const { cid } = await client.add('Hello world!')
        const file = await client.add(JSON.stringify(ans))
        console.log(file)
        const cid = file.cid
        console.log(typeof cid)
        console.log(CID.parse(cid.toString()))
        //const data = concat(await all.default(client.cat(cid)))
        let data3: string = ''
        const data2: Uint8Array[] = []
        for await (const buf of client.cat(cid)) {
            console.log(buf)
            data2.push(buf)
            console.log(new TextDecoder().decode(buf))
            data3 += new TextDecoder().decode(buf)
        }
        console.log(JSON.parse(data3))
        //const data = new TextDecoder().decode(data2);
        //console.log(data)

        //console.log(client);
        res.json({
            UNIREP_ADDRESS,
            APP_ADDRESS,
            ETH_PROVIDER_URL,
        })
    })
}
