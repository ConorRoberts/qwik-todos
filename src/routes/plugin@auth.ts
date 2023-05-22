import type { AuthConfig } from "@auth/core";
import type { Provider } from "@auth/core/providers";
import GitHub from "@auth/core/providers/github";
import { getSessionData, serverAuth$ } from "@builder.io/qwik-auth";
import type {
  RequestEvent,
  RequestEventAction,
  RequestEventBase,
} from "@builder.io/qwik-city";
import { eq } from "drizzle-orm";
import { getDatabase, users } from "~/db";

const getProviders = <T extends { get: (v: string) => string | undefined }>(
  env: T
) =>
  [
    GitHub({
      clientId: String(env.get("GITHUB_CLIENT_ID")),
      clientSecret: String(env.get("GITHUB_CLIENT_SECRET")),
    }),
  ] as Provider[];

export const getAuth = (
  req: RequestEvent | RequestEventAction | RequestEventBase,
  config?: AuthConfig
) =>
  getSessionData(req.request, {
    ...config,
    providers: getProviders(req.env),
  });

export const { onRequest, useAuthSession, useAuthSignin, useAuthSignout } =
  serverAuth$(({ env }) => {
    return {
      secret: env.get("AUTH_SECRET") ?? process.env.AUTH_SECRET,
      trustHost: true,
      providers: getProviders(env),
      callbacks: {
        signIn: async ({ user }) => {
          const db = await getDatabase(env);

          if (!user.email) {
            return false;
          }

          const foundUser = await db
            .select({ id: users.id })
            .from(users)
            .where(eq(users.email, user.email))
            .get();

          if (!foundUser) {
            await db
              .insert(users)
              .values({ id: user.id, name: user.name, email: user.email })
              .run();
          }

          return true;
        },
      },
    };
  });
