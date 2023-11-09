import { SERVER } from '../config';

export async function fetchRelayConfig() {
    const res = await fetch(`${SERVER}/api/config`);
    return res.json();
}
