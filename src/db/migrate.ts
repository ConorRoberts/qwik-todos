import { createClient } from "@libsql/client";
import { createClient as createWebClient } from "@libsql/client/web";
import { drizzle } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";
import { DATABASE_AUTH_TOKEN, DATABASE_URL } from "./env";

const db = drizzle(
  DATABASE_URL.startsWith("http")
    ? createWebClient({
        url: DATABASE_URL,
        authToken: DATABASE_AUTH_TOKEN,
      })
    : createClient({
        url: DATABASE_URL,
        authToken: DATABASE_AUTH_TOKEN,
      })
);

(async () => {
  await migrate(db, {
    migrationsFolder: "./src/db/migrations",
    migrationsTable: "migrations",
  });
  console.log("Migrations applied");
  process.exit(0);
})();
