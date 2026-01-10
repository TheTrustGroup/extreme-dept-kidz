import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../lib/auth/password';

const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2] || 'admin@extremedeptkidz.com';
  const password = process.argv[3] || 'Admin123!';
  const name = process.argv[4] || 'Super Admin';

  console.log(`Creating admin user: ${email}`);

  const passwordHash = await hashPassword(password);

  const user = await prisma.adminUser.upsert({
    where: { email },
    update: {
      passwordHash,
      name,
      role: 'super_admin',
      isActive: true,
    },
    create: {
      email,
      name,
      passwordHash,
      role: 'super_admin',
      isActive: true,
    },
  });

  console.log('✅ Admin user created successfully!');
  console.log('Email:', user.email);
  console.log('Name:', user.name);
  console.log('Role:', user.role);
  console.log('\n⚠️  Remember to set JWT_SECRET in your environment variables!');
}

main()
  .catch((error) => {
    console.error('❌ Error creating admin user:', error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
