import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  data: T;
  message?: string;
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponse<T>> {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse();
    
    return next.handle().pipe(
      map((data) => {
        // Bypass custom structured payloads
        if (data && typeof data === 'object' && 'success' in data && 'data' in data) {
          return data;
        }
        
        return {
          success: true,
          statusCode: response.statusCode,
          data: data !== undefined ? data : null,
        };
      }),
    );
  }
}
