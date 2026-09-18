/**
 * Applies every supabase/migrations/*.sql file (in name order) that has not been applied yet.
 * Works against Supabase or any Postgres: `npm run db:migrate`.
 */
import "./env";
import fs from "node:fs";
import path from "node:path";
import { getPool } from "../src/lib/db";

async function main() {
  const dir = path.join(process.cwd(), "supabase", "migrations");
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".sql")).sort();
  const pool = getPool();
  const client = await pool.connect();
  try {
    await client.query(`create table if not exists _migrations (
      name text primary key, applied_at timestamptz not null default now())`);
    const applied = new Set((await client.query("select name from _migrations")).rows.map((r) => r.name as string));
    for (const file of files) {
      if (applied.has(file)) {
        console.log(`skip   ${file} (already applied)`);
        continue;
      }
      const sql = fs.readFileSync(path.join(dir, file), "utf8");
      console.log(`apply  ${file}`);
      await client.query("begin");
      try {
        await client.query(sql);
        await client.query("insert into _migrations (name) values ($1)", [file]);
        await client.query("commit");
      } catch (err) {
        await client.query("rollback");
        throw err;
      }
    }
    console.log("migrations up to date");
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
