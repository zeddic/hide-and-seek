import * as express from 'express';
import * as fs from 'fs';
import {createServer, Server} from 'http';
import * as https from 'https';
import {
  MessageType,
  MoveMessage,
  StateUpdateMessage,
  PlayerActionMessage,
  InitGameMessage,
} from 'lancer-shared/lib/messages';
import * as socketIo from 'socket.io';
import {Socket} from 'socket.io';
import {inProd} from '../utils/env';
import {Subject, fromEvent, Observable} from 'rxjs';
import {map, tap} from 'rxjs/operators';

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
  private playerIdGen = 0;
  private onPlayerActionSubject = new Subject<OnPlayerActionEvent>();
  private onConnectSubject = new Subject<OnConnectEvent>();
  private onDisconnectSubject = new Subject<OnDisconnectEvent>();

  /**
   * Maps an active connection to the Socket subject.
   */
  private playerToSocket = new Map<number, Socket>();

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
      const player = this.playerIdGen++;
      console.log(`Connected player ${player} on port ${this.port}.`);
      this.playerToSocket.set(player, socket);

      fromEvent(socket, MessageType.PLAYER_ACTION)
        .pipe(map(msg => ({player, msg})))
        .subscribe(this.onPlayerActionSubject);

      fromEvent(socket, MessageType.DISCONNECT)
        .pipe(
          map(() => ({player})),
          tap(() => {
            this.playerToSocket.delete[player];
          })
        )
        .subscribe(this.onDisconnectSubject);

      this.onConnectSubject.next({player});
    });
  }

  sendState(player: number, msg: StateUpdateMessage) {
    // setTimeout(() => {
    this.sendMessageToPlayer(player, MessageType.STATE_UPDATE, msg);
    // }, 0);
  }

  sendInit(player: number, msg: InitGameMessage) {
    this.sendMessageToPlayer(player, MessageType.INIT, msg);
  }

  private sendMessageToPlayer(player: number, type: MessageType, msg: {}) {
    const socket = this.playerToSocket.get(player);
    if (!socket) {
      console.warn(`Failed to send msg ${type} to ${player}. Connection gone.`);
      return;
    }

    socket.emit(type, msg);
  }

  onPlayerAction() {
    return this.onPlayerActionSubject.asObservable();
  }

  onConnect() {
    return this.onConnectSubject.asObservable();
  }

  onDisconnect() {
    return this.onDisconnectSubject.asObservable();
  }
}

export interface OnPlayerActionEvent {
  player: number;
  msg: PlayerActionMessage;
}

export interface OnConnectEvent {
  player: number;
}

export interface OnDisconnectEvent {
  player: number;
}
