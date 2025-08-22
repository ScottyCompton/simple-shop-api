// prisma/add-avatar-column.js
// Script to add avatar column to auth table using Prisma

import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get the current file path
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const prisma = new PrismaClient();

async function main() {
  console.log('Adding avatar column to auth table...');
  
  try {
    // Read and execute the migration SQL
    const migrationPath = join(dirname(__dirname), 'prisma', 'migrations', '20250823_add_avatar_column', 'migration.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');
    await prisma.$executeRawUnsafe(sql);
    
    console.log('Migration completed successfully!');
    
    // Verify the column was added
    console.log('\nVerifying the column was added:');
    const result = await prisma.$queryRaw`SHOW COLUMNS FROM auth LIKE 'avatar'`;
    console.log(result);
    
    if (result.length > 0) {
      console.log('\n✅ Avatar column exists in auth table');
    } else {
      console.log('\n❌ Avatar column was not added successfully');
    }
  } catch (error) {
    console.error('Error applying migration:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
