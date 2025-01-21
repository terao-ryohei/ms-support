import { z } from "@hono/zod-openapi";
import { zValidator } from "@hono/zod-validator";
import { createFactory } from "hono/factory";
import { dbClient } from "server";
import {
  companies,
  contract,
  payment,
  sales,
  workers,
  workersRelation,
} from "../../drizzle/schema";
import { and, eq } from "drizzle-orm";

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

export const postContract = factory.createHandlers(
  zValidator(
    "json",
    z.object({
      contract: z.object({
        worker: z.string(),
        company: z.string(),
        sales: z.string(),
        from: z.string(),
        to: z.string(),
        contractType: z.string(),
        subject: z.string(),
        document: z.string(),
      }),
      payment: z.object({
        paidFrom: z.number(),
        paidTo: z.number(),
        isHour: z.boolean(),
        periodDate: z.string(),
        workPrice: z.number(),
        roundDigit: z.number(),
        roundType: z.string(),
        calcType: z.string(),
        overPrice: z.number(),
        underPrice: z.number(),
        isFixed: z.boolean(),
      }),
    }),
  ),
  async (c) => {
    const { contract: contractData, payment: paymentData } =
      c.req.valid("json");

    const contractReq = {
      ...contractData,
      from: new Date(contractData.from),
      to: new Date(contractData.to),
      isDisable: false,
    };

    const newContract = await dbClient(c.env.DB)
      .insert(contract)
      .values([{ ...contractReq }])
      .returning();

    const paymentReq = {
      ...paymentData,
      isDisable: false,
    };

    const newPayment = await dbClient(c.env.DB)
      .insert(payment)
      .values([{ ...paymentReq }])
      .returning();
    const newPayment2 = await dbClient(c.env.DB)
      .insert(payment)
      .values([{ ...paymentReq }])
      .returning();

    await dbClient(c.env.DB)
      .insert(workersRelation)
      .values([
        {
          contractId: newContract[0].id,
          paymentId: newPayment[0].id,
          workerId: 1,
          salesId: 1,
          companyId: 1,
          type: "customer",
        },
      ]);
    await dbClient(c.env.DB)
      .insert(workersRelation)
      .values([
        {
          contractId: newContract[0].id,
          paymentId: newPayment2[0].id,
          workerId: 1,
          salesId: 1,
          companyId: 1,
          type: "partner",
        },
      ]);

    return c.json({ id: newContract[0].id, paymentId: newPayment[0].id });
  },
);

export const putContract = factory.createHandlers(
  zValidator(
    "json",
    z.object({
      values: z.object({
        from: z.string().optional(),
        to: z.string().optional(),
        contractType: z.string().optional(),
        subject: z.string().optional(),
        document: z.string().optional(),
      }),
      id: z.number(),
    }),
  ),
  async (c) => {
    const { values, id } = c.req.valid("json");

    const req = {
      ...values,
      from: values.from ? new Date(values.from) : undefined,
      to: values.to ? new Date(values.to) : undefined,
      isDisable: false,
    };

    await dbClient(c.env.DB)
      .update(contract)
      .set({ ...req })
      .where(eq(contract.id, id));

    return c.json({ result: "success" });
  },
);

export const putPayment = factory.createHandlers(
  zValidator(
    "json",
    z.object({
      values: z.object({
        paidFrom: z.number().optional(),
        paidTo: z.number().optional(),
        isHour: z.boolean().optional(),
        periodDate: z.string().optional(),
        workPrice: z.number().optional(),
        roundDigit: z.number().optional(),
        roundType: z.string().optional(),
        calcType: z.string().optional(),
        overPrice: z.number().optional(),
        underPrice: z.number().optional(),
        isFixed: z.boolean().optional(),
      }),
      id: z.number(),
    }),
  ),
  async (c) => {
    const { values, id } = c.req.valid("json");

    const req = {
      ...values,
      isDisable: false,
    };

    await dbClient(c.env.DB)
      .update(payment)
      .set({ ...req })
      .where(eq(payment.id, id));

    return c.json({ result: "success" });
  },
);
