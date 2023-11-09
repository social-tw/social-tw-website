import { io, Socket } from 'socket.io-client';
import { SERVER } from './config';

export const socket: Socket = io(SERVER, {});
