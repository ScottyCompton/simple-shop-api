// scripts/regenerate-prisma.mjs
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('Diagnosing and regenerating Prisma client...');

try {
  // Check if Prisma schema exists
  const schemaPath = path.resolve('./prisma/schema.prisma');
  console.log(`Checking for schema at: ${schemaPath}`);
  
  if (!fs.existsSync(schemaPath)) {
    console.error('❌ Prisma schema file not found!');
    process.exit(1);
  }
  console.log('✅ Found Prisma schema file');
  
  // Check for node_modules/@prisma directory
  const prismaNodeModulesPath = path.resolve('./node_modules/@prisma');
  console.log(`Checking for Prisma in node_modules: ${prismaNodeModulesPath}`);
  
  if (!fs.existsSync(prismaNodeModulesPath)) {
    console.log('❌ Prisma not found in node_modules, installing...');
    execSync('npm install prisma@latest --save-dev', { stdio: 'inherit' });
  } else {
    console.log('✅ Prisma found in node_modules');
  }
  
  // Check for node_modules/.prisma directory
  const dotPrismaPath = path.resolve('./node_modules/.prisma');
  console.log(`Checking for generated client: ${dotPrismaPath}`);
  
  if (!fs.existsSync(dotPrismaPath)) {
    console.log('⚠️ Generated client not found');
  } else {
    console.log('✅ Previous generated client found');
    
    // Clean up old client first
    console.log('Cleaning up previous client...');
    try {
      fs.rmSync(dotPrismaPath, { recursive: true, force: true });
      console.log('✅ Previous client removed');
    } catch (cleanupError) {
      console.warn('⚠️ Could not remove previous client:', cleanupError.message);
    }
  }

  // Generate new client
  console.log('\nGenerating Prisma client...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  console.log('✅ Prisma client generated successfully');
  
  // Verify the generated client
  const clientIndexPath = path.resolve('./node_modules/.prisma/client/index.js');
  if (fs.existsSync(clientIndexPath)) {
    console.log('✅ Verified client was generated at the expected location');
  } else {
    console.warn('⚠️ Client generation might have failed, index.js not found');
  }
  
  console.log('\n✅ Done! Prisma client should be ready to use.');
} catch (error) {
  console.error('\n❌ Error regenerating Prisma client:');
  console.error(error);
  process.exit(1);
}
