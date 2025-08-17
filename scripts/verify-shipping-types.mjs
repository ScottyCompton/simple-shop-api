// scripts/verify-shipping-types.mjs
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    const shippingTypes = await prisma.shippingType.findMany();
    console.log('Shipping types in database:');
    console.table(shippingTypes);
  } catch (error) {
    console.error('Error querying shipping types:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
