import { component$, useSignal } from "@builder.io/qwik";
import {
  Form,
  routeLoader$,
  server$,
  type DocumentHead,
} from "@builder.io/qwik-city";
import { eq } from "drizzle-orm";
import { getDatabase, todos, users } from "~/db";
import {
  getAuth,
  useAuthSession,
  useAuthSignin,
  useAuthSignout,
} from "./plugin@auth";

export const useTodos = routeLoader$(async (req) => {
  const db = await getDatabase(req.env);
  const auth = await getAuth(req);

  if (!auth?.user?.email) return [];

  const user = await db.query.users.findFirst({
    where: eq(users.email, auth.user.email),
  });

  if (!user) return [];

  const items = await db.query.todos.findMany({
    where: eq(todos.userId, user.id),
    with: {
      user: true,
    },
  });

  return items;
});

export const createTodo = server$(async function () {
  const auth = await getAuth(this);
  const db = await getDatabase(this.env);

  if (!auth?.user?.email) return;

  const user = await db.query.users.findFirst({
    where: eq(users.email, auth.user.email),
  });

  if (!user) return;

  const newTodo = await db
    .insert(todos)
    .values({ title: "Some New Todo", userId: user.id, description: "" })
    .returning()
    .get();

  return { ...newTodo, user };
});

export const deleteTodo = server$(async function (todoId: number) {
  const auth = await getAuth(this);
  const db = await getDatabase(this.env);

  if (!auth?.user) return;

  await db.delete(todos).where(eq(todos.id, todoId)).run();
});

export default component$(() => {
  const signIn = useAuthSignin();
  const authSession = useAuthSession();
  const initialItems = useTodos();
  const items = useSignal(initialItems.value);
  const signOut = useAuthSignout();

  return (
    <div class="my-16 space-y-8">
      {authSession.value !== null && (
        <h1 class="text-3xl text-center font-bold">
          {authSession.value.user?.name}
        </h1>
      )}
      <div class="flex justify-center gap-2 items-center">
        {authSession.value === null && (
          <Form action={signIn}>
            <input type="hidden" name="providerId" value="github" />
            <button
              type="submit"
              class="bg-gray-100 font-medium text-sm px-4 py-1 transition hover:bg-gray-200 duration-75 rounded-full"
            >
              Sign In
            </button>
          </Form>
        )}
        {authSession.value !== null && (
          <>
            <Form action={signOut}>
              <button
                type="submit"
                class="bg-gray-100 font-medium text-sm px-4 py-1 transition hover:bg-gray-200 duration-75 rounded-full"
              >
                Sign Out
              </button>
            </Form>
            <button
              type="submit"
              class="bg-blue-100 font-medium text-sm px-4 py-1 transition hover:bg-blue-200 duration-75 rounded-full"
              onClick$={async () => {
                const newTodo = await createTodo();
                if (newTodo) {
                  items.value = [...items.value, newTodo];
                }
              }}
            >
              Create Todo
            </button>
          </>
        )}
      </div>

      {items.value.length > 0 && (
        <div class="mx-auto max-w-2xl border rounded-xl divide-y overflow-hidden">
          {items.value.map((t) => (
            <button
              key={t.id}
              onClick$={async () => {
                await deleteTodo(t.id);
                items.value = items.value.filter((e) => e.id !== t.id);
              }}
              class="py-6 px-8 text-sm hover:bg-gray-50 transition duration-75 w-full h-full text-left"
            >
              <p class="font-medium">
                #{t.id} - {t.title}
              </p>
              <p class="text-xs text-gray-600">{t.user?.name}</p>
            </button>
          ))}
        </div>
      )}
      {items.value.length === 0 && (
        <p class="font-medium text-sm text-gray-800 text-center my-16">
          No items
        </p>
      )}
    </div>
  );
});

export const head: DocumentHead = {
  title: "Qwik Starter",
  meta: [
    {
      name: "description",
      content: "Qwik site description",
    },
  ],
};
