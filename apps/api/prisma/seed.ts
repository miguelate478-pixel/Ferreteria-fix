import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const organization = await prisma.organization.upsert({
    where: { taxId: '20123456789' },
    update: {},
    create: { legalName: 'Ferretería Demo S.A.C.', tradeName: 'Taller de Color', taxId: '20123456789' },
  });

  const branch = await prisma.branch.upsert({
    where: { id: '11111111-1111-4111-8111-111111111111' },
    update: {},
    create: {
      id: '11111111-1111-4111-8111-111111111111',
      organizationId: organization.id,
      name: 'Sucursal Miraflores',
      address: 'Av. de demostración 123, Miraflores',
    },
  });

  const location = await prisma.inventoryLocation.upsert({
    where: { id: '22222222-2222-4222-8222-222222222222' },
    update: {},
    create: {
      id: '22222222-2222-4222-8222-222222222222',
      branchId: branch.id,
      name: 'Almacén principal',
      type: 'STORE',
    },
  });

  const product = await prisma.product.upsert({
    where: { sku: 'PINT-INT-REC' },
    update: {},
    create: {
      sku: 'PINT-INT-REC',
      name: 'Pintura Interior Lavable Recomendada',
      brand: 'Marca Demo',
      category: 'PAINT',
      description: 'Pintura lavable para interiores de tráfico residencial.',
      paintSpec: {
        create: {
          usage: ['INTERIOR'],
          compatibleSurfaces: ['TARRAJEO', 'DRYWALL', 'CONCRETO_SELLADO'],
          finish: 'SATIN',
          nominalCoverage: 10,
          minimumCoats: 2,
          dryingMinutes: 60,
          recoatingMinutes: 240,
        },
      },
    },
  });

  for (const item of [
    { sku: 'PINT-INT-REC-1L', presentation: 1, available: 20 },
    { sku: 'PINT-INT-REC-4L', presentation: 4, available: 12 },
    { sku: 'PINT-INT-REC-15L', presentation: 15, available: 3 },
  ]) {
    const variant = await prisma.productVariant.upsert({
      where: { sku: item.sku },
      update: {},
      create: {
        productId: product.id,
        sku: item.sku,
        presentation: item.presentation,
        unit: 'L',
        tintBase: 'PASTEL',
        status: 'ACTIVE',
      },
    });
    await prisma.inventoryBalance.upsert({
      where: { locationId_productVariantId: { locationId: location.id, productVariantId: variant.id } },
      update: { available: item.available },
      create: { locationId: location.id, productVariantId: variant.id, available: item.available },
    });
  }

  for (const color of [
    { code: 'TC-001', name: 'Calma mineral', rgbHex: '#DDD6C8', family: 'NEUTRAL' },
    { code: 'TC-002', name: 'Arena suave', rgbHex: '#B8AA91', family: 'BEIGE' },
    { code: 'TC-003', name: 'Oliva sereno', rgbHex: '#68705A', family: 'GREEN' },
  ]) {
    await prisma.color.upsert({
      where: { brand_code: { brand: 'Marca Demo', code: color.code } },
      update: {},
      create: { brand: 'Marca Demo', ...color },
    });
  }

  console.log('Datos de demostración creados.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => prisma.$disconnect());
