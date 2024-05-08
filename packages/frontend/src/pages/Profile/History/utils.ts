import { UserState } from '@unirep/core'

export function getEpochKeyChunks(
    userState: UserState,
    currentEpoch: number,
    chunkSize: number,
): bigint[][] {
    const epochKeys = []
    for (let i = 0; i <= currentEpoch; i++) {
        const epochKeysOfCertainEpoch = userState.getEpochKeys(i)
        Array.isArray(epochKeysOfCertainEpoch)
            ? epochKeys.push(...epochKeysOfCertainEpoch)
            : epochKeys.push(epochKeysOfCertainEpoch)
    }
    const chunks = chunkData(epochKeys, chunkSize)
    return chunks
}

export function chunkData<T>(data: T[], chunkSize: number): T[][] {
    const chunks = []
    let index = 0
    while (index < data.length) {
        chunks.push(data.slice(index, index + chunkSize))
        index += chunkSize
    }
    return chunks
}

export async function fetchAllByEpochKeysInBatches<T, U>(
    userState: UserState,
    chunkSize: number,
    fetchCall: (fetchCallParams: { epochKeys: bigint[] } & U) => Promise<T[]>,
    restFetchCallParams: U = {} as U,
) {
    const currentEpoch = userState.sync.calcCurrentEpoch()
    const epochKeyChunks = getEpochKeyChunks(userState, currentEpoch, chunkSize)
    const batchedRawPosts = await Promise.all(
        epochKeyChunks.map((epochKeyChunk) =>
            fetchCall({ epochKeys: epochKeyChunk, ...restFetchCallParams }),
        ),
    )
    console.log(batchedRawPosts)
    return batchedRawPosts
}
