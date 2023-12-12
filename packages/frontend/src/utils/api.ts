import { SERVER } from '../config'
import { ProfileHistoryPostsResponse } from '../types/api'

export async function fetchRelayConfig() {
    const res = await fetch(`${SERVER}/api/config`)
    return res.json()
}

export async function fetchLogin() {
    const res = await fetch(`${SERVER}/api/login`)
    return res.json()
    
export async function fetchProfileHistoryPosts(): Promise<ProfileHistoryPostsResponse> {
    return new Promise((resolve) =>
        setTimeout(() => {
            resolve(
                Array(1000).fill({
                    date: '2023/08/21',
                    content: '今晚烹飪義大利麵。今天的天氣真美。',
                    epochKey: '123123wLm864asf931fkaFsdDfaBvT',
                    url: '#',
                })
            )
        }, 1000)
    )
}
