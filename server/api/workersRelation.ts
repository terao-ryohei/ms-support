import { z } from "@hono/zod-openapi";
import { zValidator } from "@hono/zod-validator";
import { and, eq } from "drizzle-orm";
import { workersRelation } from "drizzle/schema";
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
