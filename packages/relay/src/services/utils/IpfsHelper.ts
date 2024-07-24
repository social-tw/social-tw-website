import type { Helia } from '@helia/interface'
import { ethers } from 'hardhat'

export class IpfsHelper {
    // store content into helia ipfs node with json plain

    async createIpfsContent(helia: Helia, content: string): Promise<string> {
        const { json } = await eval("import('@helia/json')")
        const heliaJson = json(helia)
        const cid = await heliaJson.add(JSON.stringify({ content: content }))
        return cid.toString()
    }
}

export function genVHelperIdentifier(identifier: string): string {
    const encodedId = ethers.utils.defaultAbiCoder.encode(
        ['string'],
        [identifier]
    )
    return ethers.utils.keccak256(encodedId)
}

export default new IpfsHelper()
