import e, { NextFunction } from 'express';
import { Raito } from './raito';
import { RaitoConnectionException } from './RaitoConnectionException';

export const cacheResponse = (customTtl?: number) => {
  const raito = Raito.raitoInstance;
  if (!raito) {
    throw new RaitoConnectionException(`Failed to connect with Raito server`);
  }

  return async function (req: e.Request, res: e.Response, next: NextFunction) {
    const key = `${req.method}:${req.originalUrl || req.url}`;
    const foundCache = await raito.get(key);

    if (foundCache) {
      console.log('Took from cache');
      res.send(foundCache.data);
      return;
    } else {
      const originalSend = res.send;
      res.send = (body: any) => {
        raito.set(key, body, customTtl);
        originalSend.call(res, body);
        return res;
      };
      next();
    }
  };
};
