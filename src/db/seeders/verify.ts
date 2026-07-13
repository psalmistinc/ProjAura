import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

async function verify() {
  const tables = await sql`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name`;
  console.log('\n=== TABLES ===');
  tables.forEach((t: any) => console.log(`  - ${t.table_name}`));

  const prices = await sql`SELECT fuel_type, pump_price_ghs, ex_pump_price_ghs FROM fuel_prices`;
  console.log('\n=== FUEL PRICES ===');
  prices.forEach((p: any) => console.log(`  ${p.fuel_type}: ¢${p.pump_price_ghs} (ex-pump: ¢${p.ex_pump_price_ghs})`));

  const stationCount = await sql`SELECT COUNT(*) as count FROM stations`;
  console.log(`\n=== STATIONS: ${stationCount[0].count} records ===`);

  const claimsCount = await sql`SELECT COUNT(*) as count FROM claims`;
  console.log(`=== CLAIMS: ${claimsCount[0].count} records ===`);

  const assetsCount = await sql`SELECT COUNT(*) as count FROM marketplace_assets`;
  console.log(`=== MARKETPLACE ASSETS: ${assetsCount[0].count} records ===`);

  const reportsCount = await sql`SELECT COUNT(*) as count FROM reports`;
  console.log(`=== REPORTS: ${reportsCount[0].count} records ===`);

  console.log('\nDatabase verification complete.');
}

verify().catch(console.error);
