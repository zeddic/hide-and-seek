import * as express from 'express';
import * as socketIo from 'socket.io';
import {createServer, Server} from 'http';
import * as https from 'https';
import {Socket} from 'socket.io';
import {
  ChatMessage,
  MessageType,
  MoveMessage,
  StateUpdateMessage,
  Player,
} from 'lancer-shared/lib/messages';
var cors = require('cors');
import * as fs from 'fs';
import {inProd} from './env';

// Using following tutorial as a base:
// https://medium.com/@rossbulat/typescript-live-chat-express-and-socket-io-server-setup-8d24fe13d00

const HTTPS_PRIVATE_KEY =
  '/home/zeddic/ssl/keys/cf569_cdd8f_3372f3a301d3f50fcc111c6fad231e6c.key';
const HTTPS_CERT =
  '/home/zeddic/ssl/certs/zeddic_com_cf569_cdd8f_1597103999_6f9cf0bc0e928208b689524b1aa9d382.crt';

console.log('====================');
console.log(`Prod: ${inProd}`);
console.log('====================');

export class GameServer {
  private static readonly DEFAULT_PORT: number = 8080;
  private _app: express.Application;
  private httpServer: Server;
  private httpsServer: https.Server | undefined;
  private io: SocketIO.Server;
  private port: string | number;
  private idGen = 1;

  constructor() {
    this._app = express();
    this.port = process.env.PORT || GameServer.DEFAULT_PORT;
    this._app.use(cors());
    this._app.options('*', cors());
    this.httpServer = createServer(this._app);
    this.httpsServer = inProd()
      ? https.createServer(
          {
            key: fs.readFileSync(HTTPS_PRIVATE_KEY),
            cert: fs.readFileSync(HTTPS_CERT),
            requestCert: false,
            rejectUnauthorized: false,
          },
          this._app
        )
      : undefined;

    this.initSocket();
    this.listen();
  }

  private initSocket(): void {
    this.io = socketIo();
    this.io.attach(this.httpServer);
    if (inProd()) {
      this.io.attach(this.httpsServer);
    }
  }

  private listen(): void {
    this.httpServer.listen(this.port, () => {
      console.log('Running http server on port %s', this.port);
    });

    if (inProd()) {
      this.httpsServer.listen(8081, () => {
        console.log('Running https sever on port 8081');
      });
    }

    const players: Player[] = [];

    this.io.on(MessageType.CONNECT, (socket: Socket) => {
      console.log('Connected client on port %s.', this.port);
      const id = String(this.idGen++);

      players.push({id, x: 0, y: 0});

      socket.on(MessageType.MESSAGE, (m: ChatMessage) => {
        console.log(m.message);

        console.log('[server](message): %s', JSON.stringify(m));
        this.io.emit('message', m);
      });

      socket.on(MessageType.DISCONNECT, () => {
        console.log(`Client ${id} disconnected`);
        const idx = players.findIndex(p => p.id === id);
        if (idx > -1) {
          players.splice(idx, 1);
        }
      });

      socket.on(MessageType.MOVE, (msg: MoveMessage) => {
        const player = players.find(p => p.id === id);
        if (player) {
          player.x = msg.x;
          player.y = msg.y;
        }
        console.log(`Player ${id} moved to ${player.x}, ${player.y}`);
      });
    });

    setInterval(() => {
      console.log('sending update');
      const msg: StateUpdateMessage = {players};
      this.io.emit(MessageType.STATE_UPDATE, msg);
    }, 1000 / 60);
  }

  get app(): express.Application {
    return this._app;
  }
}

const game = new GameServer();
