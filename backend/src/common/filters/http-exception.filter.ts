import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let errorName = 'InternalServerError';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const resContent: any = exception.getResponse();
      message = typeof resContent === 'object' ? resContent.message || exception.message : resContent;
      errorName = exception.name;
    } else if (exception.code && exception.code.startsWith('P')) {
      // Prisma error handling
      status = HttpStatus.BAD_REQUEST;
      message = 'Database transaction error';
      errorName = 'DatabaseException';
      this.logger.error(`Prisma Error: ${exception.message} Code: ${exception.code}`);
    } else {
      // Unhandled core exceptions
      this.logger.error(`Unhandled Exception: ${exception.message || exception}`, exception.stack);
    }

    // Shield details in production
    const isProduction = process.env.NODE_ENV === 'production';
    const devDetails = !isProduction ? { stack: exception.stack } : {};

    response.status(status).json({
      success: false,
      statusCode: status,
      path: request.url,
      timestamp: new Date().toISOString(),
      error: errorName,
      message: Array.isArray(message) ? message[0] : message, // take first validation error if array
      messages: Array.isArray(message) ? message : [message],
      ...devDetails,
    });
  }
}
