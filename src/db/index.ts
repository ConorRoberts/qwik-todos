import { createClient as createWebClient } from "@libsql/client/web";
import { drizzle } from "drizzle-orm/libsql";
import { z } from "zod";
import * as schema from "./schema";

export const getDatabase = async <
  T extends { get: (v: string) => string | undefined }
>(
  env: T
) => {
  const vars = {
    url: z.string().parse(env.get("DATABASE_URL")),
    authToken: z.string().parse(env.get("DATABASE_URL")),
  };

  // Development - Use local SQLite file with regular libSQL client
  // if (import.meta.env.DEV || process.env.NODE_ENV === "development") {
  //   const { createClient } = await import("@libsql/client");

  //   return drizzle(createClient(vars), { schema });
  // }

  // Production - Use remote DB with edge-compatible web client
  return drizzle(createWebClient(vars), { schema });
};

export * from "./schema";
