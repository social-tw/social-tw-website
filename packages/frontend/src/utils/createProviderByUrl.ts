import { ethers } from 'ethers';

export function createProviderByUrl(url: string) {
    const SCHEMA = 'http';
    return url.startsWith(SCHEMA)
        ? new ethers.providers.JsonRpcProvider(url)
        : new ethers.providers.WebSocketProvider(url);
}
