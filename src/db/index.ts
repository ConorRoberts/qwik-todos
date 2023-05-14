import { createClient } from "@libsql/client";
import { createClient as createWebClient } from "@libsql/client/web";
import { drizzle } from "drizzle-orm/libsql";
import { z } from "zod";

export const getDatabase = <
  T extends { get: (v: string) => string | undefined }
>(
  env: T
) => {
  const vars = {
    url: z.string().parse(env.get("DATABASE_URL")),
    authToken: z.string().parse(env.get("DATABASE_URL")),
  };

  // Production - Use remote DB with edge-compatible web client
  // Development - Use local SQLite file with regular libSQL client
  return drizzle(
    vars.url.startsWith("http") ? createWebClient(vars) : createClient(vars)
  );
};

export * from "./schema";
