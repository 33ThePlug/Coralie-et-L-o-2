import { db } from "../server/db";
import { users, photos, notes } from "../shared/schema";
import { sql } from "drizzle-orm";

async function main() {
  console.log("Creating database schema...");
  
  try {
    // Create tables
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS ${users} (
        id SERIAL PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL
      );
    `);
    
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS ${photos} (
        id SERIAL PRIMARY KEY,
        filename TEXT NOT NULL,
        caption TEXT,
        date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      );
    `);
    
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS ${notes} (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      );
    `);
    
    // Add default user (if not exists)
    const existingUser = await db.select().from(users).where(sql`username = 'coralieleo'`);
    
    if (existingUser.length === 0) {
      console.log("Creating default user...");
      await db.insert(users).values({
        username: "coralieleo",
        password: "4079"
      });
    }
    
    console.log("Database schema created successfully!");
  } catch (error) {
    console.error("Error creating database schema:", error);
    process.exit(1);
  } finally {
    // Close the database connection
    await db.end?.();
  }
}

main();