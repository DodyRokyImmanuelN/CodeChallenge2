import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { Prisma } from '@prisma/client';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {

    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      message = typeof res === 'string' ? res : (res as any).message;
    } else if (
  exception instanceof Prisma.PrismaClientKnownRequestError &&
    exception.code === 'P2002'
  ) {
    status = HttpStatus.CONFLICT;
    const meta = exception.meta as any;
    const indexName = meta?.driverAdapterError?.cause?.constraint?.index;
    const modelName = meta?.modelName;
    const field = indexName?.replace(`${modelName}_`, '').replace(/_key$/, '') ?? 'data tersebut';
    message = `${field} sudah digunakan`;
  }

    response.status(status).json({
      statusCode: status,
      message,
    });
  }
}