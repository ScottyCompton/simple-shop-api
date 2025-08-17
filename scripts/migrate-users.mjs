// scripts/migrate-users.mjs
import { PrismaClient } from '@prisma/client';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

async function main() {
  try {
    // Read users data from JSON file
    const dataPath = path.join(__dirname, '..', 'src', 'data', 'users.json');
    const data = await fs.readFile(dataPath, 'utf8');
    const { users } = JSON.parse(data);
    
    console.log(`Migrating ${users.length} users to the database...`);
    
    // Insert users into database
    for (const user of users) {
      await prisma.user.create({
        data: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          
          // Billing information
          billingFirstName: user.billing.firstName,
          billingLastName: user.billing.lastName,
          billingAddress1: user.billing.address1,
          billingAddress2: user.billing.address2 || '',
          billingCity: user.billing.city,
          billingState: user.billing.state,
          billingZip: user.billing.zip,
          billingPhone: user.billing.phone,
          
          // Shipping information
          shippingFirstName: user.shipping.firstName,
          shippingLastName: user.shipping.lastName,
          shippingAddress1: user.shipping.address1,
          shippingAddress2: user.shipping.address2 || '',
          shippingCity: user.shipping.city,
          shippingState: user.shipping.state,
          shippingZip: user.shipping.zip,
          shippingPhone: user.shipping.phone,
        },
      });
    }
    
    console.log('Users migration completed successfully!');
  } catch (error) {
    console.error('Error migrating users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
