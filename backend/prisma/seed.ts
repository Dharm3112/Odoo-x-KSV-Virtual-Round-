import { PrismaClient, Role, UserStatus } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

const SEED_EMAIL = 'admin@vendorbridge.local';
const SEED_PASSWORD = 'Admin@1234';
const SEED_FIRST_NAME = 'System';
const SEED_LAST_NAME = 'Administrator';

const ARGON2_OPTIONS: argon2.Options = {
  type: argon2.argon2id,
  memoryCost: 65536,
  timeCost: 3,
  parallelism: 4,
};

async function main(): Promise<void> {
  const existing = await prisma.user.findUnique({ where: { email: SEED_EMAIL } });
  if (existing) {
    console.log(`[seed] Admin user "${SEED_EMAIL}" already exists. Skipping.`);
    return;
  }

  const passwordHash = await argon2.hash(SEED_PASSWORD, ARGON2_OPTIONS);
  const admin = await prisma.user.create({
    data: {
      email: SEED_EMAIL,
      passwordHash,
      firstName: SEED_FIRST_NAME,
      lastName: SEED_LAST_NAME,
      role: Role.admin,
      status: UserStatus.active,
    },
  });

  console.log(`[seed] Created admin user "${admin.email}" (id=${admin.id})`);
  console.log(`[seed] Login credentials: ${SEED_EMAIL} / ${SEED_PASSWORD}`);
}

main()
  .catch((error) => {
    console.error('[seed] Failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
