import { io } from 'socket.io-client'
import { SERVER } from './config'
import { EventType, VoteMsg } from './types/VoteAction'
class SocketClient {
    socket = io(SERVER, {})

    onVoteEvent(callback: any) {
        this.socket.on(EventType.VOTE, (data: VoteMsg) => {
            callback(data)
        })
    }
}

const client = new SocketClient()

export default client
