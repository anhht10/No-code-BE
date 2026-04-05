import { Injectable, Logger, NestMiddleware } from "@nestjs/common";
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
    private logger = new Logger('HTTP');
    use(req: Request, res: Response, next: NextFunction) {
        const userAgent = req.get('user-agent') || '';

        this.logger.log(`${req.method} ${req.originalUrl} ${req.ip} ${userAgent}`);
        next();
    }
}