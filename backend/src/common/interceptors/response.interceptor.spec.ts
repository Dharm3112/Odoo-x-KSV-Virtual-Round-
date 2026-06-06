import { CallHandler, ExecutionContext } from '@nestjs/common';
import { firstValueFrom, of } from 'rxjs';
import { ResponseInterceptor } from './response.interceptor';

describe('ResponseInterceptor', () => {
  it('wraps controller data in the standard success envelope', async () => {
    const interceptor = new ResponseInterceptor();
    const next: CallHandler = { handle: () => of({ id: '123' }) };
    const result = await firstValueFrom(interceptor.intercept({} as ExecutionContext, next));
    expect(result).toEqual({ success: true, data: { id: '123' } });
  });

  it('does not double-wrap an existing response envelope', async () => {
    const interceptor = new ResponseInterceptor();
    const next: CallHandler = { handle: () => of({ success: true, data: [] }) };
    const result = await firstValueFrom(interceptor.intercept({} as ExecutionContext, next));
    expect(result).toEqual({ success: true, data: [] });
  });
});
