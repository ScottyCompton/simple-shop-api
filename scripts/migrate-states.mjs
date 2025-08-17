// scripts/migrate-states.mjs
import { PrismaClient } from '@prisma/client';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

async function main() {
  try {
    // Read states data from JSON file
    const dataPath = path.join(__dirname, '..', 'src', 'data', 'states.json');
    const data = await fs.readFile(dataPath, 'utf8');
    const { states } = JSON.parse(data);
    
    console.log(`Migrating ${states.length} states to the database...`);
    
    // Insert states into database
    for (const state of states) {
      await prisma.state.create({
        data: {
          id: state.id,
          abbr: state.abbr,
          state: state.state,
        },
      });
    }
    
    console.log('States migration completed successfully!');
  } catch (error) {
    console.error('Error migrating states:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
