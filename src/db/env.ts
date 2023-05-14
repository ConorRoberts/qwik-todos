import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const { DATABASE_AUTH_TOKEN, DATABASE_URL } = createEnv({
  server: {
    DATABASE_URL: z.string().min(1),
    DATABASE_AUTH_TOKEN: z.string().min(1),
  },
  client: {},
  clientPrefix: "PUBLIC",
  runtimeEnv: process.env,
});
