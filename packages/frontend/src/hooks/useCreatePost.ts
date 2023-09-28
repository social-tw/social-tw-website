import { useRef, useState } from 'react'
import { stringifyBigInts } from '@unirep/utils'
import { SERVER } from '../config'
import { useUser } from '../contexts/User'
import makeCancellableTask from '../utils/makeCancellableTask'

function randomNonce() {
    return Math.round(Math.random())
}

export default function useCreatePost() {
    const { userState, stateTransition, provider, loadData } = useUser()

    const [isCancellable, setIsCancellable] = useState(true)
    const [isCancelled, setIsCancelled] = useState(false)

    const cancellableTask = useRef(
        makeCancellableTask(
            async ({ run, setCancellable }) =>
                async (content: string) => {
                    if (!userState)
                        throw new Error('user state not initialized')

                    const latestTransitionedEpoch = await run(
                        userState.latestTransitionedEpoch()
                    )
                    if (
                        userState.sync.calcCurrentEpoch() !==
                        latestTransitionedEpoch
                    ) {
                        await run(stateTransition())
                    }

                    const nonce = randomNonce()
                    const epochKeyProof = await run(
                        userState.genEpochKeyProof({
                            nonce,
                        })
                    )

                    setCancellable(false)

                    const data = await fetch(`${SERVER}/api/post`, {
                        method: 'POST',
                        headers: {
                            'content-type': 'application/json',
                        },
                        body: JSON.stringify(
                            stringifyBigInts({
                                content,
                                publicSignals: epochKeyProof.publicSignals,
                                proof: epochKeyProof.proof,
                            })
                        ),
                    }).then((r) => r.json())
                    await provider.waitForTransaction(data.transaction)
                    await userState.waitForSync()
                    await loadData(userState)
                },
            {
                onCancellableChange(isCancellable) {
                    setIsCancellable(isCancellable)
                },
                onCancel: () => {
                    setIsCancelled(true)
                },
                onReset: () => {
                    setIsCancellable(true)
                    setIsCancelled(false)
                },
            }
        )
    )

    const { task: create, cancel, reset } = cancellableTask.current

    return {
        create,
        cancel,
        reset,
        isCancellable,
        isCancelled,
    }
}
