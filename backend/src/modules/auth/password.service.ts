import { Injectable } from '@nestjs/common';
import * as argon2 from 'argon2';

const ARGON2_OPTIONS: argon2.Options = {
  type: argon2.argon2id,
  memoryCost: 65536,
  timeCost: 3,
  parallelism: 4,
};

/**
 * Password hashing & verification service.
 *
 * Wraps the `argon2` library and enforces the project-wide Argon2id parameters
 * (64MB memory, 3 iterations, 4 parallelism, 16-byte salt). Both parameters and
 * salt length are baked into the resulting hash string by `argon2`, so future
 * verification remains valid even if parameters are re-tuned.
 */
@Injectable()
export class PasswordService {
  async hash(plain: string): Promise<string> {
    return argon2.hash(plain, { ...ARGON2_OPTIONS, raw: false });
  }

  async verify(hash: string, plain: string): Promise<boolean> {
    if (!hash || !plain) {
      return false;
    }
    try {
      return await argon2.verify(hash, plain);
    } catch {
      return false;
    }
  }
}
