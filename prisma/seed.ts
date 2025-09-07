import { PrismaClient, TenantPlan, TenantStatus, UserRole } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const tenant = await prisma.tenant.create({
    data: {
      name: 'Demo Tenant',
      plan: TenantPlan.FREE,
      status: TenantStatus.ACTIVE,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  const branch = await prisma.branch.create({
    data: {
      tenantId: tenant.id,
      name: 'Sucursal Centro',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  await prisma.user.create({
    data: {
      tenantId: tenant.id,
      branchId: branch.id,
      name: 'Admin',
      email: 'admin@test.com',
      password: 'changeme',
      role: UserRole.ADMIN,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  console.log('Seed listo 🚀');
}

main().finally(() => prisma.$disconnect());
