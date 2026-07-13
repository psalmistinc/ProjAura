import { defineConfig } from 'drizzle-kit';
import * as dotenv from 'dotenv';
import * as fs from 'fs';

// Load .env.local (Next.js convention)
if (fs.existsSync('.env.local')) {
  dotenv.config({ path: '.env.local' });
} else if (fs.existsSync('.env')) {
  dotenv.config({ path: '.env' });
}

export default defineConfig({
  schema: './src/db/schema/*.sql.ts',
  out: './src/db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
