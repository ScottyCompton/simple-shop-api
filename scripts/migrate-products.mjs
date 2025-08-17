// scripts/migrate-products.mjs
import { PrismaClient } from '@prisma/client';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

async function main() {
  try {
    // Read products data from JSON file
    const dataPath = path.join(__dirname, '..', 'src', 'data', 'products.json');
    const data = await fs.readFile(dataPath, 'utf8');
    const { products } = JSON.parse(data);
    
    console.log(`Migrating ${products.length} products to the database...`);
    
    // Insert products into database
    for (const product of products) {
      await prisma.product.create({
        data: {
          id: product.id,
          name: product.name,
          price: product.price,
          category: product.category,
          inStock: product.inStock,
          shortDesc: product.shortDesc,
          imgUrl: product.imgUrl,
          mfgName: product.mfgName,
          longDesc: product.longDesc,
        },
      });
    }
    
    console.log('Products migration completed successfully!');
  } catch (error) {
    console.error('Error migrating products:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
