export interface ICache {
  key: string;
  data: string;
  createdAt: Date;
  ttl?: number;
}

interface IRaito {
  get(key: string): Promise<ICache | null>;
  set(key: string, data: any, ttl?: number): Promise<void>;
  clear(key: string | 'all'): Promise<void>;
  close(): void;
}

export type ConnectionOptions = {
  host?: string;
  port?: number;
  ttl?: number;
};

export class Raito implements IRaito {
  constructor(options?: ConnectionOptions);
  public get(key: string): Promise<ICache | null>;
  public set(key: string, data: any, ttl?: number): Promise<void>;
  public clear(key: string | 'all'): Promise<void>;
  public close(): void;
}

export {};
