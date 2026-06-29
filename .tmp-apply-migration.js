require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const postgres = require('postgres');
const sql = postgres(process.env.DATABASE_URL, { ssl: 'require' });
(async () => {
  const files = ['./drizzle/0000_white_owl.sql', './drizzle/0001_tranquil_bishop.sql'];
  for (const file of files) {
    const migration = fs.readFileSync(file, 'utf8');
    const statements = migration
      .split('--> statement-breakpoint')
      .map((s) => s.trim())
      .filter(Boolean);

    for (const statement of statements) {
      await sql([statement]);
      console.log('Applied:', statement.split('\n')[0]);
    }
  }

  const rows = await sql`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name`;
  console.log(JSON.stringify(rows));
  await sql.end();
})();
