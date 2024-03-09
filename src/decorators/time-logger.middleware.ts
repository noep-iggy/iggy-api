/* istanbul ignore file */
'use strict';
import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class TimeLoggerMiddleware implements NestMiddleware {
  private logger = new Logger('HTTP');

  getLogLevelForResponseTime(responseTime: number): 'LOG' | 'WARN' | 'ERROR' {
    if (responseTime < 500) {
      return 'LOG';
    } else if (responseTime < 1000) {
      return 'WARN';
    } else {
      return 'ERROR';
    }
  }

  use(request: Request, response: Response, next: NextFunction): void {
    const startAt = process.hrtime();
    const { method, originalUrl } = request;

    response.on('finish', () => {
      const { statusCode } = response;
      const diff = process.hrtime(startAt);
      const responseTime = diff[0] * 1e3 + diff[1] * 1e-6;
      const logLevel = this.getLogLevelForResponseTime(responseTime);
      const logString = `${method} ${originalUrl} ${statusCode} ${responseTime}ms`;
      if (logLevel === 'LOG') this.logger.log(`\u001b[32m ${logString}\x1b[0m`);
      else if (logLevel === 'WARN')
        this.logger.log(`\x1b[33m ${logString}\x1b[0m`);
      else this.logger.log(`\x1B[31m ${logString}\x1b[0m`);
    });

    next();
  }
}
