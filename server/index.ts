// server/index.ts
import { Hono } from "hono";

import type { D1Database } from "@cloudflare/workers-types";
import { drizzle } from "drizzle-orm/d1";
import { poweredBy } from "hono/powered-by";
import { createClaim } from "server/api/claim/excel";
import { insertSampleData } from "server/api/createSampleData";
import {
  deleteContract,
  getAllContract,
  getContract,
  getContractAndPayment,
  postContract,
  putContract,
} from "./api/contract";
import { createOrder } from "./api/order/excel";
import { createQuote } from "./api/quote/excel";
import { getCompany, postCompany, deleteCompany } from "./api/companies";
import { putPayment } from "./api/payment";
import { getSales, postSales, deleteSales } from "./api/sales";
import { getWorker, postWorker, deleteWorker } from "./api/worker";
import { putWorkersRelation } from "./api/workersRelation";

export const dbClient = (db: D1Database | undefined) => {
  if (!db) {
    throw new Error("Database not found");
  }
  return drizzle(db);
};

const app = new Hono<{ Bindings: Env }>()
  .basePath("/")
  .onError((err, ctx) => {
    console.error(err);
    return ctx.json({ error: "Internal Server Error" }, 500);
  })
  .get("api/sales", ...getSales)
  .get("api/companies", ...getCompany)
  .get("api/workers", ...getWorker)
  .get("api/contract", ...getContract)
  .get("api/contract/all", ...getAllContract)
  .get("api/contract/payment", ...getContractAndPayment)
  .post("api/sales", ...postSales)
  .post("api/companies", ...postCompany)
  .post("api/workers", ...postWorker)
  .post("api/test", ...insertSampleData)
  .post("api/claim/excel", ...createClaim)
  .post("api/order/excel", ...createOrder)
  .post("api/quote/excel", ...createQuote)
  .post("api/contract", ...postContract)
  .put("api/contract", ...putContract)
  .put("api/payment", ...putPayment)
  .put("api/relation", ...putWorkersRelation)
  .delete("api/sales", ...deleteSales)
  .delete("api/companies", ...deleteCompany)
  .delete("api/workers", ...deleteWorker)
  .delete("api/contract", ...deleteContract)
  .use(poweredBy());

export type AppType = typeof app;

export default app;
