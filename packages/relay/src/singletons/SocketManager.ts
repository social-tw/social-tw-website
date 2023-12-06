import * as http from 'http'
import { Server } from 'socket.io'
import { DefaultEventsMap } from 'socket.io/dist/typed-events'
import { CLIENT_URL } from '../config'
import { CommentMsg, RoomType, VoteMsg } from '../types/SocketTypes'

export class SocketManager {
    io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>

    constructor(httpServer: http.Server) {
        this.io = new Server(httpServer, {
            cors: {
                origin: CLIENT_URL,
                methods: ['GET', 'POST'],
            },
        })
        this.io.on('connection', (socket) => {
            console.log('a user connected')
            socket.on('disconnect', () => {
                console.log('user disconnected')
            })
            socket.join(RoomType.VOTE)
            socket.join(RoomType.COMMENT)
        })

        // assign this to singleton
        socketManager = this
    }

    emitVote = (vote: VoteMsg) => {
        this.io.to(RoomType.VOTE).emit('vote', vote)
    }

    emitComment = (comment: CommentMsg) => {
        this.io.to(RoomType.COMMENT).emit('comment', comment)
    }
}

export let socketManager: SocketManager
