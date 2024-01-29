import { AbstractHttpAdapter } from '@nestjs/core';
import { Catch, ArgumentsHost, ExceptionFilter } from '@nestjs/common';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: AbstractHttpAdapter) {}
  catch(exception: any, host: ArgumentsHost): void {
    let httpStatus: number;
    const httpAdapter = this.httpAdapterHost;
    const ctx = host.switchToHttp();

    if (
      !Array.isArray(exception.response.message) &&
      exception.response.statusCode >= 400 &&
      exception.response.statusCode < 500
    ) {
      const errorMessage = {
        statusCode: httpStatus,
        message: exception.response,
      };

      return httpAdapter.reply(ctx.getResponse(), errorMessage, httpStatus);
    }

    if (exception.response.message) {
      httpStatus = exception.status;
      const errorMessage = exception.response.message;

      const errors = errorMessage.map((msg) => {
        const field = msg.split(' ');
        const err = {
          field: field[0],
          message: msg,
        };
        return err;
      });

      return httpAdapter.reply(ctx.getResponse(), errors, httpStatus);
    }

    if (exception.response) {
      httpStatus = exception.status;

      const errorMessage = {
        statusCode: httpStatus,
        message: exception.response,
      };
      return httpAdapter.reply(ctx.getResponse(), errorMessage, httpStatus);
    }
    httpAdapter.reply(ctx.getResponse(), exception, exception.status);
  }
}
