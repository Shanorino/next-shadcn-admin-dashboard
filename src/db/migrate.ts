import * as dotenv from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

dotenv.config({ path: ".env.local" });

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

const sql = postgres(connectionString, { max: 1 });
const db = drizzle(sql);

async function main() {
  console.log("Running migrations...");

  await migrate(db, { migrationsFolder: "./src/db/migrations" });

  console.log("Migrations completed!");
  process.exit(0);
}

main().catch((err) => {
  console.error("Migration failed!", err);
  process.exit(1);
});
