import { Contract, ethers } from 'ethers'
import { DB } from 'anondb/node'
import { APP_ADDRESS } from '../config'
import UNIREP_APP from '@unirep-app/contracts/artifacts/contracts/UnirepApp.sol/UnirepApp.json'
import { LogDescription } from 'ethers/lib/utils'

export class TransactionManager {
    appContract?: Contract
    wallet?: ethers.Wallet
    _db?: DB

    /**
     * Configure the transaction manager with key, provider, and database.
     *
     * @param key - The key for the wallet.
     * @param provider - The provider for the ethers wallet.
     * @param db - The database instance.
     */
    configure(key: string, provider: any, db: DB) {
        this.wallet = new ethers.Wallet(key, provider)
        this._db = db
        this.appContract = new ethers.Contract(
            APP_ADDRESS,
            UNIREP_APP.abi,
            provider
        )
    }

    /**
     * Start the transaction manager.
     */
    async start() {
        if (!this.wallet || !this._db) throw new Error('Not initialized')
        const latestNonce = await this.wallet.getTransactionCount()
        await this._db.upsert('AccountNonce', {
            where: {
                address: this.wallet.address,
            },
            create: {
                address: this.wallet.address,
                nonce: latestNonce,
            },
            update: {},
        })
        this.startDaemon()
    }

    /**
     * Start the daemon to continuously check for transactions.
     */
    async startDaemon() {
        if (!this._db) throw new Error('No db connected')
        for (;;) {
            const nextTx = await this._db.findOne('AccountTransaction', {
                where: {},
                orderBy: {
                    nonce: 'asc',
                },
            })
            if (!nextTx) {
                await new Promise((r) => setTimeout(r, 5000))
                continue
            }
            const sent = await this.tryBroadcastTransaction(nextTx.signedData)
            if (sent) {
                await this._db.delete('AccountTransaction', {
                    where: {
                        signedData: nextTx.signedData,
                    },
                })
            } else {
                const randWait = Math.random() * 2000
                await new Promise((r) => setTimeout(r, 1000 + randWait))
            }
        }
    }

    /**
     * Try broadcasting a signed transaction.
     *
     * @param signedData - The signed transaction data.
     * @returns True if the transaction was sent, false otherwise.
     */
    async tryBroadcastTransaction(signedData: string) {
        if (!this.wallet) throw new Error('Not initialized')
        const hash = ethers.utils.keccak256(signedData)
        try {
            console.log(`Sending tx ${hash}`)
            await this.wallet.provider.sendTransaction(signedData)
            return true
        } catch (err: any) {
            const tx = await this.wallet.provider.getTransaction(hash)
            if (tx) {
                // if the transaction is reverted the nonce is still used, so we return true
                return true
            }
            if (
                err
                    .toString()
                    .indexOf(
                        'Your app has exceeded its compute units per second capacity'
                    ) !== -1
            ) {
                await new Promise((r) => setTimeout(r, 1000))
                return this.tryBroadcastTransaction(signedData)
            } else {
                console.log(err)
                return false
            }
        }
    }

    /**
     * Get the nonce for a given address.
     *
     * @param address - The address to get the nonce for.
     * @returns The nonce for the given address.
     */
    async getNonce(address: string) {
        const latest = await this._db?.findOne('AccountNonce', {
            where: {
                address,
            },
        })
        const updated = await this._db?.update('AccountNonce', {
            where: {
                address,
                nonce: latest.nonce,
            },
            update: {
                nonce: latest.nonce + 1,
            },
        })
        if (updated === 0) {
            await new Promise((r) => setTimeout(r, Math.random() * 500))
            return this.getNonce(address)
        }
        return latest.nonce
    }

    /**
     * Execute a transaction and return parsed logs.
     *
     * @param contract - The contract instance.
     * @param to - The address to send the transaction to.
     * @param data - The transaction data.
     * @returns An array of parsed logs.
     */
    async executeTransaction(
        contract: Contract,
        to: string,
        data: string | any = {}
    ): Promise<(ethers.utils.LogDescription | null)[]> {
        const hash = await this.queueTransaction(to, data)
        const receipt = await this.wallet?.provider.waitForTransaction(hash)

        let parsedLogs: (ethers.utils.LogDescription | null)[] = []
        if (receipt && receipt.logs) {
            parsedLogs = receipt.logs
                .map((log: ethers.providers.Log) => {
                    try {
                        return contract.interface.parseLog(log)
                    } catch (e) {
                        return null // It's not an event from our contract, ignore.
                    }
                })
                .filter(
                    (log: ethers.utils.LogDescription | null) => log !== null
                )
        }
        return parsedLogs ?? null
    }

    /**
     * Queue a transaction for execution.
     *
     * @param to - The address to send the transaction to.
     * @param data - The transaction data.
     * @returns The keccak256 hash of the signed transaction.
     */
    async queueTransaction(to: string, data: string | any = {}) {
        const args = {} as any
        if (typeof data === 'string') {
            // assume it's input data
            args.data = data
        } else {
            Object.assign(args, data)
        }
        if (!this.wallet) throw new Error('Not initialized')
        if (!args.gasLimit) {
            // don't estimate, use this for unpredictable gas limit tx's
            // transactions may revert with this
            let gasLimit
            try {
                gasLimit = await this.wallet.provider.estimateGas({
                    to,
                    from: this.wallet.address,
                    ...args,
                })
            } catch (error) {
                const err = error as any
                if (
                    err.message &&
                    err.message.includes('UserAlreadySignedUp')
                ) {
                    console.error('The user has already signed up.')
                } else {
                    console.error(err)
                }
            }

            Object.assign(args, {
                gasLimit: gasLimit.add(50000),
            })
        }
        const nonce = await this.getNonce(this.wallet.address)
        const signedData = await this.wallet.signTransaction({
            nonce,
            to,
            // gasPrice: 2 * 10 ** 9, // 2 gwei
            // gasPrice: 10000,
            gasPrice: 299365979,
            ...args,
        })
        await this._db?.create('AccountTransaction', {
            address: this.wallet.address,
            signedData,
            nonce,
        })
        return ethers.utils.keccak256(signedData)
    }
}

export default new TransactionManager()
