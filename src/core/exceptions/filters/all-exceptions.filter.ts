import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { DomainExceptionCode } from '../domain-exception-codes';
import { ErrorResponseBody } from './error-response-body.type';
import { Response, Request } from 'express';
import { CoreConfig } from '../../core.config';
import { ThrottlerException } from '@nestjs/throttler';

//Все ошибки
@Catch()
export class AllHttpExceptionsFilter implements ExceptionFilter {
  constructor(private coreConfig: CoreConfig) {}
  catch(exception: any, host: ArgumentsHost): void {
    if (exception instanceof ThrottlerException) {
      throw exception;
    }
    //ctx нужен, чтобы получить request и response (express). Это из документации, делаем по аналогии
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    //Если сработал этот фильтр, то пользователю улетит 500я ошибка
    let message = 'Unknown exception occurred.';
    if (exception instanceof Error) {
      message = exception.message;
    }
    const status = HttpStatus.INTERNAL_SERVER_ERROR;
    const responseBody = this.buildResponseBody(request.url, message);

    response.status(status).json(responseBody);
  }

  private buildResponseBody(
    requestUrl: string,
    message: string,
  ): ErrorResponseBody {
    //TODO: Replace with getter from configService. will be in the following lessons

    if (!this.coreConfig.sendInternalServerErrorDetails) {
      return {
        timestamp: new Date().toISOString(),
        path: null,
        message: 'Some error occurred',
        extensions: [],
        code: DomainExceptionCode.InternalServerError,
      };
    }

    return {
      timestamp: new Date().toISOString(),
      path: requestUrl,
      message,
      extensions: [],
      code: DomainExceptionCode.InternalServerError,
    };
  }
}
