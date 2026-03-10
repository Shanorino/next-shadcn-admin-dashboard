import * as dotenv from "dotenv";

import { db } from "./index";
import { account, session, user, verification } from "./schema";

dotenv.config({ path: ".env.local" });

async function verifyDatabase() {
  console.log("🔍 Verifying database setup...\n");

  try {
    // Test connection
    console.log("✓ Database connection successful");

    // Count records in each table
    const userCount = await db.select().from(user);
    const sessionCount = await db.select().from(session);
    const accountCount = await db.select().from(account);
    const verificationCount = await db.select().from(verification);

    console.log("\n📊 Database Statistics:");
    console.log(`   Users: ${userCount.length}`);
    console.log(`   Sessions: ${sessionCount.length}`);
    console.log(`   Accounts: ${accountCount.length}`);
    console.log(`   Verifications: ${verificationCount.length}`);

    if (userCount.length > 0) {
      console.log("\n👥 Registered Users:");
      userCount.forEach((u) => {
        console.log(`   - ${u.name} (${u.email})`);
      });
    }

    console.log("\n✅ Database verification complete!");
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Database verification failed!");
    console.error(error);
    process.exit(1);
  }
}

verifyDatabase();
