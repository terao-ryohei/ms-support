import { z } from "@hono/zod-openapi";
import { zValidator } from "@hono/zod-validator";
import { eq } from "drizzle-orm";
import { createFactory } from "hono/factory";
import { dbClient } from "server";
import { companies, contract, sales, workers } from "../../drizzle/schema";

const factory = createFactory<Env>();

export const deleteSales = factory.createHandlers(
  zValidator(
    "json",
    z.object({
      id: z.number(),
    }),
  ),
  async (c) => {
    const { id } = c.req.valid("json");

    const res = await dbClient(c.env.DB)
      .update(sales)
      .set({ isDisable: true })
      .where(eq(sales.id, id));

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

export const deleteWorker = factory.createHandlers(
  zValidator(
    "json",
    z.object({
      id: z.number(),
    }),
  ),
  async (c) => {
    const { id } = c.req.valid("json");

    const res = await dbClient(c.env.DB)
      .update(workers)
      .set({ isDisable: true })
      .where(eq(workers.id, id));

    return c.json(res);
  },
);

export const deleteContract = factory.createHandlers(
  zValidator(
    "json",
    z.object({
      id: z.number(),
    }),
  ),
  async (c) => {
    const { id } = c.req.valid("json");

    const res = await dbClient(c.env.DB)
      .update(contract)
      .set({ isDisable: true })
      .where(eq(contract.id, id));

    return c.json(res);
  },
);
