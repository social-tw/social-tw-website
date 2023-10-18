import { stringifyBigInts } from '@unirep/utils'
import { SERVER } from '../config'
import { useUser } from '../contexts/User'
import { VoteAction } from '../types/VoteAction'

export default function useVotes() {
    const { userState, stateTransition, provider, loadData } = useUser()

    const randomNonce = () => Math.round(Math.random())

    const create = async (
        _id: string,
        voteAction: VoteAction
    ): Promise<boolean> => {
        try {
            if (!userState) throw new Error('User state not initialized')

            await stateTransition()

            const nonce = randomNonce()

            const epochKeyProof = await userState.genEpochKeyProof({ nonce })

            const response = await fetch(`${SERVER}/api/vote`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(
                    stringifyBigInts({
                        _id,
                        voteAction,
                        publicSignals: epochKeyProof.publicSignals,
                        proof: epochKeyProof.proof,
                    })
                ),
            })

            const data = await response.json()

            await provider.waitForTransaction(data.transaction)

            await userState.waitForSync()

            await loadData(userState)

            if (data.status === 201) {
                console.log('Vote succeeded!')
                return true
            } else {
                throw new Error(`Vote failed with status: ${data.status}`)
            }
        } catch (error) {
            console.error('Vote failed:', error)
            return false
        }
    }

    return { create }
}
