import e, { NextFunction } from 'express';
import { Raito } from './raito';

export const cacheMiddleware = (raito: Raito, customTtl?: number) => {
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
