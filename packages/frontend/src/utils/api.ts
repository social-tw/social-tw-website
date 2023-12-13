import { SERVER } from '../config'

export async function fetchRelayConfig() {
    const res = await fetch(`${SERVER}/api/config`)
    return res.json()
}

export async function fetchLogin() {
    const res = await fetch(`${SERVER}/api/login`)
    return res.json()
}
