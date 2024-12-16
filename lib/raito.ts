import {
  ConnectionOptions,
  ICache,
  IRaito,
  WsMessage,
  WsResult,
} from '@src/types';
import WebSocket from 'ws';
import { RaitoResultException } from './RaitoResultException';

export class Raito implements IRaito {
  private wss: WebSocket;
  private isConnected: boolean = false;

  constructor(private readonly options?: ConnectionOptions) {
    const connectionStr = `ws://${options?.host || 'localhost'}:${options?.port || 9180}`;
    this.wss = new WebSocket(connectionStr);
    this.handleConnection();
  }

  public async get(key: string): Promise<ICache | null> {
    await this.ensureConnected();

    const message: WsMessage = {
      command: 'get',
      args: [key],
    };

    this.wss.send(JSON.stringify(message));
    return await this.handleResult();
  }

  public async set(key: string, data: any, ttl?: number): Promise<void> {
    await this.ensureConnected();

    const message: WsMessage = {
      command: 'set',
      args: [key, data, (ttl ?? this.options?.ttl)?.toString()],
    };

    this.wss.send(JSON.stringify(message));
    await this.handleResult();
  }

  public async clear(key: string): Promise<void> {
    await this.ensureConnected();

    const message: WsMessage = {
      command: 'clear-cache',
      args: [key],
    };

    this.wss.send(JSON.stringify(message));
    await this.handleResult();
  }

  public close(): void {
    if (
      this.wss.readyState === WebSocket.OPEN ||
      this.wss.readyState === WebSocket.CONNECTING
    ) {
      this.wss.close();
    }
  }

  private handleConnection() {
    this.wss.on('open', () => {
      this.isConnected = true;
    });

    this.wss.on('close', () => {
      this.isConnected = false;
    });
  }

  private async ensureConnected(): Promise<void> {
    if (this.wss.readyState === WebSocket.OPEN && this.isConnected) {
      return;
    }

    return await new Promise<void>((resolve, reject) => {
      this.wss.on('open', resolve);
      this.wss.on('close', reject);
    });
  }

  private async handleResult(): Promise<ICache | null> {
    return new Promise<ICache | null>((resolve, reject) => {
      this.wss.once('message', (message) => {
        const { error, success, data } = JSON.parse(
          message.toString(),
        ) as WsResult;
        if (error) {
          reject(new RaitoResultException(error));
          return;
        }

        if (success && data) {
          resolve(data);
          return;
        }
        resolve(null);
      });
    });
  }
}
