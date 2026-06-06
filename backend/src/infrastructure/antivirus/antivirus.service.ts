import {
  Injectable,
  ServiceUnavailableException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Socket } from 'node:net';

export type AntivirusScanResult =
  | { status: 'clean' }
  | { status: 'infected'; signature: string }
  | { status: 'unavailable'; reason: string };

@Injectable()
export class AntivirusService {
  constructor(private readonly configService: ConfigService) {}

  async ping(): Promise<boolean> {
    try {
      const response = await this.sendCommand(Buffer.from('zPING\0'));
      return response.trim() === 'PONG';
    } catch {
      return false;
    }
  }

  async scan(buffer: Buffer): Promise<AntivirusScanResult> {
    try {
      const header = Buffer.alloc(4);
      header.writeUInt32BE(buffer.length);
      const terminator = Buffer.alloc(4);
      const response = await this.sendCommand(
        Buffer.concat([Buffer.from('zINSTREAM\0'), header, buffer, terminator]),
      );

      if (response.includes('FOUND')) {
        const signature = response
          .replace(/^stream:\s*/i, '')
          .replace(/\s+FOUND.*$/i, '')
          .trim();
        return { status: 'infected', signature };
      }

      if (response.includes('OK')) {
        return { status: 'clean' };
      }

      return { status: 'unavailable', reason: response.trim() || 'Unknown ClamAV response' };
    } catch (error) {
      return {
        status: 'unavailable',
        reason: error instanceof Error ? error.message : 'ClamAV scan failed',
      };
    }
  }

  async assertClean(buffer: Buffer): Promise<void> {
    const result = await this.scan(buffer);
    if (result.status === 'infected') {
      throw new UnprocessableEntityException(`File rejected by antivirus: ${result.signature}`);
    }
    if (result.status === 'unavailable') {
      throw new ServiceUnavailableException(
        `File scanning is currently unavailable: ${result.reason}`,
      );
    }
  }

  private sendCommand(payload: Buffer): Promise<string> {
    const host = this.configService.getOrThrow<string>('CLAMAV_HOST');
    const port = Number(this.configService.getOrThrow<string>('CLAMAV_PORT'));
    const timeout = Number(this.configService.get<string>('CLAMAV_TIMEOUT_MS', '10000'));

    return new Promise((resolve, reject) => {
      const socket = new Socket();
      const chunks: Buffer[] = [];
      let settled = false;

      const finish = (error?: Error): void => {
        if (settled) return;
        settled = true;
        socket.destroy();
        if (error) {
          reject(error);
        } else {
          resolve(Buffer.concat(chunks).toString('utf8').replace(/\0/g, ''));
        }
      };

      socket.setTimeout(timeout, () => finish(new Error('ClamAV request timed out')));
      socket.on('error', (error) => finish(error));
      socket.on('data', (chunk: Buffer) => chunks.push(chunk));
      socket.on('end', () => finish());
      socket.connect(port, host, () => socket.end(payload));
    });
  }
}
