import { z } from "@hono/zod-openapi";
import { zValidator } from "@hono/zod-validator";
import { eq } from "drizzle-orm";
import { companies } from "drizzle/schema";
import { createFactory } from "hono/factory";
import { dbClient } from "server";

const factory = createFactory<Env>();

export const postCompany = factory.createHandlers(
  zValidator(
    "json",
    z.object({
      name: z.string(),
    }),
  ),
  async (c) => {
    const { name } = c.req.valid("json");

    const res = await dbClient(c.env.DB)
      .insert(companies)
      .values({ name, isDisable: false })
      .returning();

    return c.json(res);
  },
);

export const deleteCompany = factory.createHandlers(
  zValidator(
    "json",
    z.object({
      id: z.number(),
    }),
  ),
  async (c) => {
    const { id } = c.req.valid("json");

    const res = await dbClient(c.env.DB)
      .update(companies)
      .set({ isDisable: true })
      .where(eq(companies.id, id));

    return c.json(res);
  },
);

export const getCompany = factory.createHandlers(async (c) => {
  const companyData = await dbClient(c.env.DB)
    .select({
      id: companies.id,
      name: companies.name,
    })
    .from(companies)
    .where(eq(companies.isDisable, false))
    .orderBy(companies.name); // 並び替え

  return c.json(companyData);
});
