require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is missing!");
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);

(async () => {
  try {
    console.log("Checking columns for 'users' table...");
    const columns = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'users';
    `;
    console.log("USERS COLUMNS:", JSON.stringify(columns, null, 2));

    console.log("Checking tables in database...");
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public';
    `;
    console.log("TABLES:", JSON.stringify(tables, null, 2));
  } catch (err) {
    console.error("Database query failed:", err);
  }
})();
