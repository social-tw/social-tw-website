import { io } from 'socket.io-client'
import { SERVER } from './config'
import { EventType } from './types'
import { VoteMsg } from './types/Vote'
import { CommentMsg } from './types/Comments'

class SocketClient {
    socket = io(SERVER, {})

    onVoteEvent(callback: (data: VoteMsg) => void) {
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
