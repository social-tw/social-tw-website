import type { Helia } from '@helia/interface'
import {json} from '@helia/json'

// FIXME: is it okay not to be singleton?
export class IpfsService {
    // store content into helia ipfs node with json plain

    // const { json } = await eval("import('@helia/json')")
    async createIpfsContent (
        helia: Helia,
        content: string
    ): Promise<string>{
        const heliaJson = json(helia)
        const cid = await heliaJson
            .add(JSON.stringify({ content: content }))
            .toString()
        return cid
    }
}

export const ipfsService = new IpfsService()
