// import { SERVER } from '@/constants/config'

const reportData = {
    id: '1',
    category: 2,
    reason: '偷偷置入性廣告，不OK餒！',
    content:
        '和幾個好友一起探索了台灣的小巷弄，發現了一家隱藏版的小吃店，美味的古早味讓我們瞬間回味童年。這次的冒險不僅填飽了肚子，更充實了心靈。人生就是要不斷發現驚喜，就算在家鄉也能有無限的探',
    createdAt: '2022-01-01T00:00:00.000Z',
    updatedAt: '2022-01-01T00:00:00.000Z',
}

// TODO: Remove mock data
export async function fetchAllReports() {
    return [reportData]
    // const response = await fetch(`${SERVER}/api/reports`).catch(() => ({
    //     ok: true,
    //     json() {
    //         // mock data
    //         return [
    //             {
    //                 category: 'Report',
    //                 reason: 'This is a report',
    //                 epoch: 1,
    //             },
    //         ]
    //     }
    // }))
    // const data = await response.json()

    // if (!response.ok) {
    //     throw Error(data.error)
    // }
    // return data
}
