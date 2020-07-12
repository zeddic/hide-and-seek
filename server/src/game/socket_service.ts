import * as express from 'express';
import * as fs from 'fs';
import {createServer, Server} from 'http';
import * as https from 'https';
import {
  MessageType,
  MoveMessage,
  StateUpdateMessage,
} from 'lancer-shared/lib/messages';
import * as socketIo from 'socket.io';
import {Socket} from 'socket.io';
import {inProd} from '../utils/env';
var cors = require('cors');

const HTTPS_PRIVATE_KEY =
  '/home/zeddic/ssl/keys/cf569_cdd8f_3372f3a301d3f50fcc111c6fad231e6c.key';

const HTTPS_CERT =
  '/home/zeddic/ssl/certs/zeddic_com_cf569_cdd8f_1597103999_6f9cf0bc0e928208b689524b1aa9d382.crt';

export class SocketService {
  private static readonly DEFAULT_PORT: number = 8080;
  private expressApp: express.Application;
  private httpServer: Server;
  private httpsServer: https.Server | undefined;
  private io: SocketIO.Server;
  private port: string | number;

  constructor() {
    this.expressApp = express();
    this.port = process.env.PORT || SocketService.DEFAULT_PORT;
    this.expressApp.use(cors());
    this.expressApp.options('*', cors());
    this.httpServer = createServer(this.expressApp);
    this.httpsServer = inProd()
      ? https.createServer(
          {
            key: fs.readFileSync(HTTPS_PRIVATE_KEY),
            cert: fs.readFileSync(HTTPS_CERT),
            requestCert: false,
            rejectUnauthorized: false,
          },
          this.expressApp
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

    this.io.on(MessageType.CONNECT, (socket: Socket) => {
      console.log('Connected client on port %s.', this.port);

      // socket.on(MessageType.MESSAGE, (m: ChatMessage) => {
      //   this.io.emit('message', m);
      // });

      socket.on(MessageType.DISCONNECT, () => {});

      socket.on(MessageType.MOVE, (msg: MoveMessage) => {});
    });

    // setInterval(() => {
    //   const msg: StateUpdateMessage = {players};
    //   this.io.emit(MessageType.STATE_UPDATE, msg);
    // }, 1000 / 60);
  }

  sendStateUpdate(msg: StateUpdateMessage) {
    this.io.emit(MessageType.STATE_UPDATE, msg);
  }
}
