import { NestMiddleware } from '@nestjs/common';
import { NextFunction, Response, Request } from 'express';
import { Logger } from '@nestjs/common';

export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const logger = new Logger('HTTP');
    const logData = {
      method: req.method,
      url: req.originalUrl,
      body: req.body,
      headers: req.headers,
      query: req.query,
    };

    logger.log(`Request:\n${JSON.stringify(logData, null, 2)}`);
    next();
  }
}
