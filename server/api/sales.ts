import { z } from "@hono/zod-openapi";
import { zValidator } from "@hono/zod-validator";
import { eq } from "drizzle-orm";
import { sales } from "drizzle/schema";
import { createFactory } from "hono/factory";
import { dbClient } from "server";

const factory = createFactory<Env>();

export const postSales = factory.createHandlers(
  zValidator(
    "json",
    z.object({
      name: z.string(),
    }),
  ),
  async (c) => {
    const { name } = c.req.valid("json");

    const res = await dbClient(c.env.DB)
      .insert(sales)
      .values({ name, isDisable: false })
      .returning();

    return c.json(res);
  },
);

export const getSales = factory.createHandlers(async (c) => {
  const db = dbClient(c.env.DB);

  const salesData = await db
    .select({ id: sales.id, name: sales.name })
    .from(sales)
    .where(eq(sales.isDisable, false))
    .orderBy(sales.id)
    .all();

  return c.json(salesData);
});

export const getSalesAll = factory.createHandlers(async (c) => {
  const db = dbClient(c.env.DB);

  const salesData = await db.select().from(sales).orderBy(sales.id).all();

  return c.json(salesData);
});

export const putSales = factory.createHandlers(
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
      .update(sales)
      .set({ ...values })
      .where(eq(sales.id, id));

    return c.json(res);
  },
);
