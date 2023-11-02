import type { Helia } from '@helia/interface'
// import {json} from '@helia/json'

// FIXME: is it okay not to be singleton?
export class IpfsService {
    // store content into helia ipfs node with json plain
        
    async createIpfsContent (
        helia: Helia,
        content: string
    ): Promise<string>{
        const { json } = await import("@helia/json");
        const heliaJson = json(helia)
        const cid = await heliaJson
            .add(JSON.stringify({ content: content }))
            .toString()
        return cid
    }
}

export const ipfsService = new IpfsService()
