import { ServiceUnavailableException, UnprocessableEntityException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AntivirusService } from './antivirus.service';

describe('AntivirusService', () => {
  let service: AntivirusService;

  beforeEach(() => {
    service = new AntivirusService(new ConfigService());
  });

  it('allows clean files', async () => {
    jest.spyOn(service, 'scan').mockResolvedValue({ status: 'clean' });
    await expect(service.assertClean(Buffer.from('safe'))).resolves.toBeUndefined();
  });

  it('rejects infected files', async () => {
    jest
      .spyOn(service, 'scan')
      .mockResolvedValue({ status: 'infected', signature: 'Eicar-Test-Signature' });
    await expect(service.assertClean(Buffer.from('infected'))).rejects.toBeInstanceOf(
      UnprocessableEntityException,
    );
  });

  it('fails closed when ClamAV is unavailable', async () => {
    jest.spyOn(service, 'scan').mockResolvedValue({ status: 'unavailable', reason: 'offline' });
    await expect(service.assertClean(Buffer.from('unknown'))).rejects.toBeInstanceOf(
      ServiceUnavailableException,
    );
  });
});
