import * as express from 'express';
import * as socketIo from 'socket.io';
import {createServer, Server} from 'http';
import * as https from 'https';
import {Socket} from 'socket.io';
import {ChatMessage, MessageType} from 'lancer-shared/lib/messages';
var cors = require('cors');
import * as fs from 'fs';

// Using following tutorial as a base:
// https://medium.com/@rossbulat/typescript-live-chat-express-and-socket-io-server-setup-8d24fe13d00

export class GameServer {
  private static readonly DEFAULT_PORT: number = 8080;
  private _app: express.Application;
  private httpServer: Server;
  private httpsServer: https.Server;
  private io: SocketIO.Server;
  private port: string | number;

  constructor() {
    this._app = express();
    this.port = process.env.PORT || GameServer.DEFAULT_PORT;
    this._app.use(cors());
    this._app.options('*', cors());
    this.httpServer = createServer(this._app);

    this.httpsServer = https.createServer(
      {
        key: fs.readFileSync(
          '/home/zeddic/ssl/keys/cf569_cdd8f_3372f3a301d3f50fcc111c6fad231e6c.key'
        ),
        cert: fs.readFileSync(
          '/home/zeddic/ssl/certs/zeddic_com_cf569_cdd8f_1597103999_6f9cf0bc0e928208b689524b1aa9d382.crt'
        ),
        // ca: fs.readFileSync('./test_ca.crt'),
        requestCert: false,
        rejectUnauthorized: false,
      },
      this._app
    );

    // this.httpServer.listen(8080);

    this.initSocket();
    this.listen();
  }

  private initSocket(): void {
    this.io = socketIo();
    this.io.attach(this.httpServer);
    this.io.attach(this.httpsServer);
  }

  private listen(): void {
    this.httpServer.listen(this.port, () => {
      console.log('Running http server on port %s', this.port);
    });

    this.httpsServer.listen(8081, () => {
      console.log('Running https sever on port 8081');
    });

    this.io.on(MessageType.CONNECT, (socket: Socket) => {
      console.log('Connected client on port %s.', this.port);

      socket.on(MessageType.MESSAGE, (m: ChatMessage) => {
        console.log(m.message);

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

const game = new GameServer();
