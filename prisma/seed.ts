import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function getOrCreateTenantByName(name: string, plan: any, status: any) {
  const existing = await prisma.tenant.findFirst({ where: { name } });
  if (existing) return existing;
  return prisma.tenant.create({
    data: { name, plan, status },
  });
}

async function getOrCreateBranchByName(tenantId: string, name: string, address?: string, phone?: string) {
  const existing = await prisma.branch.findFirst({
    where: { tenantId, name },
  });
  if (existing) return existing;
  return prisma.branch.create({
    data: { tenantId, name, address, phone },
  });
}

async function upsertUserByTenantEmail(tenantId: string, email: string, data: {
  name: string;
  password: string; // hash
  role: any;
  isActive?: boolean;
  branchId?: string | null;
}) {
  const existing = await prisma.user.findFirst({
    where: { tenantId, email: email.toLowerCase() },
    select: { id: true },
  });
  if (existing) {
    return prisma.user.update({
      where: { id: existing.id },
      data,
    });
  }
  return prisma.user.create({
    data: {
      tenantId,
      email: email.toLowerCase(),
      ...data,
    },
  });
}

async function main() {
  // ========= SUPER ADMIN + ROOT =========
  const email = process.env.SEED_SUPER_ADMIN_EMAIL || 'root@system.local';
  const password = process.env.SEED_SUPER_ADMIN_PASSWORD || 'changeme123!';
  const tenantName = process.env.SEED_SUPER_ADMIN_TENANT_NAME || 'Gourmetify Root';

  const rootTenant = await getOrCreateTenantByName(tenantName, 'ENTERPRISE', 'ACTIVE');

  const superHash = await bcrypt.hash(password, 10);
  await upsertUserByTenantEmail(rootTenant.id, email, {
    name: 'Super Admin',
    password: superHash,  // tu campo `password` guarda el hash
    role: 'SUPER_ADMIN',
    isActive: true,
  });

  // ========= DEMO TENANTS =========
  const demos = [
    {
      name: 'Nova Sushi',
      plan: 'PRO',
      status: 'ACTIVE',
      admin: { name: 'Admin Nova', email: 'admin@nova.local', password: 'nova1234' },
      branches: [
        { name: 'Nova Centro', address: 'Av. Principal 123', phone: '1111-1111' },
        { name: 'Nova Norte', address: 'Calle 45 #678', phone: '2222-2222' },
      ],
    },
    {
      name: 'DMA Repuestos',
      plan: 'PRO',
      status: 'ACTIVE',
      admin: { name: 'Admin DMA', email: 'admin@dma.local', password: 'dma1234' },
      branches: [
        { name: 'DMA Central', address: 'Av. Talleres 555', phone: '3333-3333' },
      ],
    },
  ];

  for (const t of demos) {
    const tenant = await getOrCreateTenantByName(t.name, t.plan as any, t.status as any);

    // branches
    for (const b of t.branches) {
      await getOrCreateBranchByName(tenant.id, b.name, b.address, b.phone);
    }

    // admin
    const adminHash = await bcrypt.hash(t.admin.password, 10);
    await upsertUserByTenantEmail(tenant.id, t.admin.email, {
      name: t.admin.name,
      password: adminHash,
      role: 'ADMIN',
      isActive: true,
    });
  }

  console.log('✅ Seed completo: SUPER_ADMIN + tenants demo + branches + admins');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
