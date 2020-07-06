import * as express from 'express';
import * as socketIo from 'socket.io';
import {createServer, Server} from 'http';
import {Socket} from 'socket.io';
var cors = require('cors');

// Using following tutorial as a base:
// https://medium.com/@rossbulat/typescript-live-chat-express-and-socket-io-server-setup-8d24fe13d00

export class GameServer {
  private static readonly DEFAULT_PORT: number = 8080;
  private _app: express.Application;
  private server: Server;
  private io: SocketIO.Server;
  private port: string | number;

  constructor() {
    this._app = express();
    this.port = process.env.PORT || GameServer.DEFAULT_PORT;
    this._app.use(cors());
    this._app.options('*', cors());
    this.server = createServer(this._app);
    this.initSocket();
    this.listen();
  }

  private initSocket(): void {
    this.io = socketIo(this.server);
  }

  private listen(): void {
    this.server.listen(this.port, () => {
      console.log('Running server on port %s', this.port);
    });

    this.io.on(MessageType.CONNECT, (socket: Socket) => {
      console.log('Connected client on port %s.', this.port);

      socket.on(MessageType.MESSAGE, (m: ChatMessage) => {
        console.log('[server](message): %s', JSON.stringify(m));
        this.io.emit('message', m);
      });

      socket.on(MessageType.DISCONNECT, () => {
        console.log('Client disconnected');
      });
    });
  }

  get app(): express.Application {
    return this._app;
  }
}

export enum MessageType {
  CONNECT = 'connect',
  DISCONNECT = 'disconnect',
  MESSAGE = 'message',
}

interface ChatMessage {
  message: string;
}

const game = new GameServer();
