import { Test } from '@nestjs/testing';
import * as argon2 from 'argon2';
import { PasswordService } from './password.service';

describe('PasswordService', () => {
  let service: PasswordService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [PasswordService],
    }).compile();
    service = moduleRef.get(PasswordService);
  });

  it('hashes a password and verifies it successfully', async () => {
    const plain = 'StrongPass1!';
    const hash = await service.hash(plain);
    expect(hash).toBeDefined();
    expect(hash).not.toBe(plain);
    expect(hash.startsWith('$argon2id$')).toBe(true);
    await expect(service.verify(hash, plain)).resolves.toBe(true);
  });

  it('rejects an incorrect password', async () => {
    const hash = await service.hash('StrongPass1!');
    await expect(service.verify(hash, 'WrongPass1!')).resolves.toBe(false);
  });

  it('returns false when hash or plain is empty', async () => {
    const hash = await service.hash('StrongPass1!');
    await expect(service.verify(hash, '')).resolves.toBe(false);
    await expect(service.verify('', 'StrongPass1!')).resolves.toBe(false);
  });

  it('uses Argon2id with 64MB memory cost, 3 iterations, 4 parallelism', async () => {
    const hash = await service.hash('StrongPass1!');
    expect(hash).toMatch(/\$argon2id\$v=19\$m=65536,t=3,p=4\$/);
  });

  it('falls back to false when verify throws (malformed hash)', async () => {
    await expect(service.verify('not-a-real-hash', 'whatever')).resolves.toBe(false);
  });

  it('produces unique hashes for the same input (random salt)', async () => {
    const a = await service.hash('StrongPass1!');
    const b = await service.hash('StrongPass1!');
    expect(a).not.toBe(b);
    expect(argon2.verify(a, 'StrongPass1!')).resolves.toBe(true);
    expect(argon2.verify(b, 'StrongPass1!')).resolves.toBe(true);
  });
});
