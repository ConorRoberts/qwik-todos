import { component$, useSignal } from "@builder.io/qwik";
import {
	Form,
	routeAction$,
	routeLoader$,
	z,
	zod$,
	type DocumentHead,
} from "@builder.io/qwik-city";
import { eq } from "drizzle-orm";
import { getDatabase, todos, users } from "~/db";
import Modal from "~/integrations/react/Modal";
import {
	getAuth,
	useAuthSession,
	useAuthSignin,
	useAuthSignout,
} from "./plugin@auth";

export const useTodos = routeLoader$(async (req) => {
  const db = getDatabase(req.env);
  const auth = await getAuth(req);

  if (!auth?.user?.email) return [];

	
  const user = await db
	.select({ id: users.id })
    .from(users)
    .where(eq(users.email, auth.user.email))
    .get();
		
	if (!user) return [];

  const items = await db
    .select({
      id: todos.id,
      title: todos.title,
      description: todos.description,
      user: { id: users.id, name: users.name },
    })
    .from(todos)
    .leftJoin(users, eq(users.id, todos.userId))
    .where(eq(users.id, user.id))
    .all();

  return items;
});

export const useCreateTodo = routeAction$(async (_, req) => {
  const auth = await getAuth(req);
  const db = getDatabase(req.env);

  if (!auth?.user?.email) return;

  const user = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, auth.user.email))
    .get();

  if (!user) return;

  const newTodo = await db
    .insert(todos)
    .values({ title: "Some New Todo", userId: user.id, description: "" })
    .run();


  return newTodo;
});

export const useDeleteTodo = routeAction$(async ({ todoId }, req) => {
  const auth = await getAuth(req);
  const db = getDatabase(req.env);

  if (!auth?.user) return;

  await db.delete(todos).where(eq(todos.id, todoId)).run();
}, zod$({ todoId: z.coerce.number() }));

export default component$(() => {
  const signIn = useAuthSignin();
  const authSession = useAuthSession();
  const items = useTodos();
  const createTodo = useCreateTodo();
  const deleteTodo = useDeleteTodo();
  const modalOpen = useSignal(false);
  const signOut = useAuthSignout();
  const numberValue = useSignal(0);

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
          <Form action={signOut}>
            <button
              type="submit"
              class="bg-gray-100 font-medium text-sm px-4 py-1 transition hover:bg-gray-200 duration-75 rounded-full"
            >
              Sign Out
            </button>
          </Form>
        )}
        <Form action={createTodo}>
          <button
            type="submit"
            class="bg-blue-100 font-medium text-sm px-4 py-1 transition hover:bg-blue-200 duration-75 rounded-full"
          >
            Create Todo
          </button>
        </Form>
        <button
          class="bg-green-100 font-medium text-sm px-4 py-1 transition hover:bg-green-200 duration-75 rounded-full"
          onClick$={() => (modalOpen.value = true)}
        >
          Open Modal
        </button>
      </div>
      <Modal
        open={modalOpen.value}
        onOpenChange$={(value) => {
          modalOpen.value = value;
        }}
        client:load
      >
        <button onClick$={() => numberValue.value++}>INCREMENT</button>
        <p>{numberValue.value}</p>
      </Modal>
      {items.value.length > 0 && (
        <div class="mx-auto max-w-2xl border rounded-xl divide-y overflow-hidden">
          {items.value.map((t) => (
            <Form key={t.id} action={deleteTodo}>
              <input type="hidden" name="todoId" value={t.id} />
              <button
                class="py-6 px-8 text-sm hover:bg-gray-50 transition duration-75 w-full h-full text-left"
                type="submit"
              >
                <p class="font-medium">
                  #{t.id} - {t.title}
                </p>
                <p class="text-xs text-gray-600">{t.user?.name}</p>
              </button>
            </Form>
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
  title: "Welcome to Qwik",
  meta: [
    {
      name: "description",
      content: "Qwik site description",
    },
  ],
};
