import { UserState } from '@unirep/core'

export function getEpochKeyChunks(
    userState: UserState,
    currentEpoch: number,
    chunkSize: number,
): bigint[][] {
    const epochKeys = []
    for (let i = 0; i < currentEpoch; i++) {
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

export function formatDate(date: Date, format: string): string {
    const map: Record<string, string> = {
        yyyy: date.getFullYear().toString(),
        MM: ('0' + (date.getMonth() + 1)).slice(-2),
        dd: ('0' + date.getDate()).slice(-2),
        HH: ('0' + date.getHours()).slice(-2),
        mm: ('0' + date.getMinutes()).slice(-2),
        ss: ('0' + date.getSeconds()).slice(-2),
    }
    return format.replace(/yyyy|MM|dd|HH|mm|ss/g, (match) => map[match])
}
