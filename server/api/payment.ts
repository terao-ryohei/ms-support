import { z } from "@hono/zod-openapi";
import { zValidator } from "@hono/zod-validator";
import { eq } from "drizzle-orm";
import { payment } from "drizzle/schema";
import { createFactory } from "hono/factory";
import { dbClient } from "server";

const factory = createFactory<Env>();

export const putPayment = factory.createHandlers(
  zValidator(
    "json",
    z.object({
      values: z.object({
        paidFrom: z.number().optional(),
        paidTo: z.number().optional(),
        payType: z.string().optional(),
        periodDate: z.string().optional(),
        workPrice: z.number().optional(),
        roundDigit: z.number().optional(),
        roundType: z.string().optional(),
        calcType: z.string().optional(),
        overPrice: z.number().optional(),
        underPrice: z.number().optional(),
        from: z.string().optional(),
        to: z.string().optional(),
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
      .update(payment)
      .set({
        ...req,
      })
      .where(eq(payment.id, id));

    return c.json({ result: "success" });
  },
);
