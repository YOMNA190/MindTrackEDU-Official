import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hash = (pw: string) => bcrypt.hash(pw, 12);

  await prisma.user.upsert({
    where: { email: 'student@mindtrack.edu' },
    update: {},
    create: {
      email:        'student@mindtrack.edu',
      name:         'Sara Ahmed',
      passwordHash: await hash('Student@123'),
      role:         'STUDENT',
    },
  });

  await prisma.user.upsert({
    where: { email: 'therapist@mindtrack.edu' },
    update: {},
    create: {
      email:        'therapist@mindtrack.edu',
      name:         'Dr. Hana Youssef',
      passwordHash: await hash('Therapist@123'),
      role:         'THERAPIST',
    },
  });

  await prisma.user.upsert({
    where: { email: 'admin@mindtrack.edu' },
    update: {},
    create: {
      email:        'admin@mindtrack.edu',
      name:         'Admin User',
      passwordHash: await hash('Admin@123'),
      role:         'ADMIN',
    },
  });

  console.log('✅ Seed complete');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
