import type { Helia } from '@helia/interface'

export class IpfsService {
    // store content into helia ipfs node with json plain

    async createIpfsContent(helia: Helia, content: string): Promise<string> {
        const { json } = await eval("import('@helia/json')")
        const heliaJson = json(helia)
        const cid = await heliaJson.add(JSON.stringify({ content: content }))
        return cid.toString()
    }
}

export const ipfsService = new IpfsService()
