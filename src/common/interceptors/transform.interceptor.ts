import {
    CallHandler,
    ExecutionContext,
    Injectable,
    NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { RESPONSE_MESSAGE } from '../decorators/response-message.decorator';

export interface Response<T> {
    statusCode: number;
    message: string;
    data: T;
    metadata?: Record<string, any>;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, Response<T>> {
    constructor(private readonly reflector: Reflector) { }

    intercept(
        context: ExecutionContext,
        next: CallHandler,
    ): Observable<Response<T>> {
        return next.handle().pipe(
            map((result) => {
                let responseData = result;
                let responseMetadata = {};
                if (result && typeof result === 'object' && !Array.isArray(result)) {
                    if ('data' in result && 'metadata' in result) {
                        responseData = result.data;
                        responseMetadata = result.metadata;
                    }
                }
                return {
                    statusCode: context.switchToHttp().getResponse().statusCode,
                    message:
                        this.reflector.get<string>(RESPONSE_MESSAGE, context.getHandler()) ||
                        '',
                    data: responseData,
                    metadata: responseMetadata,
                };
            }),
        );
    }
}