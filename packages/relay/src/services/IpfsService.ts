import type { Helia } from '@helia/interface'

class IpfsService {
    private helia: Helia

    constructor(helia: Helia) {
        this.helia = helia
    }

    // store content into helia ipfs node with json plain
    // TODO wrap this method to one service or singleton
    const { json } = await eval("import('@helia/json')")
    const heliaJson = json(this.helia)
    const cid = await heliaJson
        .add(JSON.stringify({ content: content }))
        .toString()
        
        const hash = await TransactionManager.queueTransaction(
            APP_ADDRESS,
            calldata
    )
}

export const ipfsService = new IpfsService()