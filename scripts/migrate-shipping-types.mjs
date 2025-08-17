// scripts/migrate-shipping-types.mjs
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Shipping types data
const shippingTypes = [
  { value: "standard", label: "USPS Ground", price: 5.99 },
  { value: "express", label: "UPS 2-Day", price: 11.99 },
  { value: "overnight", label: "FedEx Overnight", price: 19.99 },
];

async function main() {
  try {
    console.log(`Migrating ${shippingTypes.length} shipping types to the database...`);
    
    // Insert shipping types into database
    for (const shippingType of shippingTypes) {
      await prisma.shippingType.create({
        data: {
          value: shippingType.value,
          label: shippingType.label,
          price: shippingType.price,
        },
      });
    }
    
    console.log('Shipping types migration completed successfully!');
  } catch (error) {
    console.error('Error migrating shipping types:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
