import { io } from 'socket.io-client'
import { SERVER } from './config'
import { CommentMsg, EventType, VoteMsg } from './types'

class SocketClient {
    socket = io(SERVER, {})

    onVoteEvent(callback: any) {
        this.socket.on(EventType.VOTE, (data: VoteMsg) => {
            callback(data)
        })
    }

    onCommentEvent(callback: (data: CommentMsg) => void) {
        this.socket.on(EventType.COMMENT, callback)

        return () => {
            this.socket.on(EventType.COMMENT, callback)
        }
    }
}

const client = new SocketClient()

export default client
