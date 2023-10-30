import { Server } from 'socket.io'
import { CLIENT_URL } from '../config'
import { DefaultEventsMap } from 'socket.io/dist/typed-events'
import * as http from 'http'

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
        })
    }
}

export let manager: SocketManager
