import { z } from "@hono/zod-openapi";
import { zValidator } from "@hono/zod-validator";
import { eq } from "drizzle-orm";
import { workers } from "drizzle/schema";
import { createFactory } from "hono/factory";
import { dbClient } from "server";

const factory = createFactory<Env>();

export const postWorker = factory.createHandlers(
  zValidator(
    "json",
    z.object({
      name: z.string(),
    }),
  ),
  async (c) => {
    const { name } = c.req.valid("json");

    const res = await dbClient(c.env.DB)
      .insert(workers)
      .values({ name, isDisable: false })
      .returning();

    return c.json(res);
  },
);

export const getWorker = factory.createHandlers(async (c) => {
  const workerData = await dbClient(c.env.DB)
    .select({ id: workers.id, name: workers.name })
    .from(workers)
    .where(eq(workers.isDisable, false))
    .orderBy(workers.id); // 並び替え

  return c.json(workerData);
});

export const getWorkerAll = factory.createHandlers(async (c) => {
  const workerData = await dbClient(c.env.DB)
    .select()
    .from(workers)
    .orderBy(workers.id); // 並び替え

  return c.json(workerData);
});

export const putWorker = factory.createHandlers(
  zValidator(
    "json",
    z.object({
      id: z.number(),
      values: z.object({
        isDisable: z.boolean().optional(),
        name: z.string().optional(),
      }),
    }),
  ),
  async (c) => {
    const { id, values } = c.req.valid("json");

    const res = await dbClient(c.env.DB)
      .update(workers)
      .set({ ...values })
      .where(eq(workers.id, id));

    return c.json(res);
  },
);
