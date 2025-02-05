import { z } from "@hono/zod-openapi";
import { zValidator } from "@hono/zod-validator";
import { and, eq } from "drizzle-orm";
import {
  companies,
  contract,
  payment,
  sales,
  workers,
  workersRelation,
} from "drizzle/schema";
import { createFactory } from "hono/factory";
import { dbClient } from "server";

const factory = createFactory<Env>();

export const putWorkersRelation = factory.createHandlers(
  zValidator(
    "json",
    z.object({
      id: z.number(),
      type: z.string(),
      value: z.number(),
      mode: z.string(),
    }),
  ),
  async (c) => {
    const { id, type, value, mode } = c.req.valid("json");

    await dbClient(c.env.DB)
      .update(workersRelation)
      .set({ [type]: value })
      .where(
        and(
          eq(workersRelation.contractId, id),
          mode === "all" ? undefined : eq(workersRelation.type, mode),
        ),
      );

    return c.json({ result: "success" });
  },
);

export const getWorkersRelation = factory.createHandlers(
  zValidator(
    "query",
    z.object({
      id: z.string(),
    }),
  ),
  async (c) => {
    const { id } = c.req.valid("query");

    const data = await dbClient(c.env.DB)
      .select()
      .from(workersRelation)
      .leftJoin(
        sales,
        eq(workersRelation.salesId, sales.id), // JOIN 条件
      )
      .leftJoin(
        companies,
        eq(workersRelation.companyId, companies.id), // JOIN 条件
      )
      .leftJoin(
        workers,
        eq(workersRelation.workerId, workers.id), // JOIN 条件
      )
      .innerJoin(
        contract,
        eq(workersRelation.contractId, contract.id), // JOIN 条件
      )
      .innerJoin(
        payment,
        eq(workersRelation.paymentId, payment.id), // JOIN 条件
      )
      .where(
        and(
          eq(workersRelation.contractId, Number(id)),
          eq(sales.isDisable, false),
          eq(companies.isDisable, false),
          eq(workers.isDisable, false),
          eq(contract.isDisable, false),
          eq(payment.isDisable, false),
        ),
      )
      .all();

    const paymentData = data.map(({ payment }) => payment);

    const res = { ...(data.length > 0 ? data[0] : {}), payment: paymentData };

    return c.json({ res });
  },
);
