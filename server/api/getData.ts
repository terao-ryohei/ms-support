import { z } from "@hono/zod-openapi";
import {
  companies,
  contract,
  payment,
  sales,
  workers,
  workersRelation,
} from "../../drizzle/schema";
import { zValidator } from "@hono/zod-validator";
import { and, eq } from "drizzle-orm";
import { createFactory } from "hono/factory";
import { dbClient } from "server";
import { datePipe } from "~/utils/datePipe";
import { calcPeriod } from "~/utils/calcPeriod";

const factory = createFactory<Env>();

export const getSales = factory.createHandlers(async (c) => {
  const db = dbClient(c.env.DB);

  // 1. セールスデータを取得
  const salesData = await db
    .select()
    .from(sales)
    .where(eq(sales.isDisable, false))
    .orderBy(sales.name)
    .all();

  // 3. 結果を返却
  return c.json(salesData);
});

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

export const getWorker = factory.createHandlers(async (c) => {
  const workerData = await dbClient(c.env.DB)
    .select({
      id: workers.id,
      name: workers.name,
    })
    .from(workers)
    .where(eq(workers.isDisable, false))
    .orderBy(workers.name); // 並び替え

  return c.json(workerData);
});

export const getContract = factory.createHandlers(
  zValidator(
    "query",
    z.object({
      id: z.string(),
      type: z.string(),
    }),
  ),
  async (c) => {
    const { id, type } = c.req.valid("query");

    const contractData = await dbClient(c.env.DB)
      .select({
        id: contract.id,
        worker: workers.name,
        company: companies.name,
        sales: sales.name,
        subject: contract.subject,
        from: contract.from,
        to: contract.to,
        contractType: contract.contractType,
        paidFrom: payment.paidFrom,
        paidTo: payment.paidTo,
        document: contract.document,
        periodDate: payment.periodDate,
        workPrice: payment.workPrice,
        roundDigit: payment.roundDigit,
        roundType: payment.roundType,
        overPrice: payment.overPrice,
        underPrice: payment.underPrice,
        calcType: payment.calcType,
        isHour: payment.isHour,
        isFixed: payment.isFixed,
        salesId: sales.id,
        companyId: companies.id,
        workerId: workers.id,
        paymentId: payment.id,
      })
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
          eq(workersRelation.type, type),
          eq(sales.isDisable, false),
          eq(companies.isDisable, false),
          eq(workers.isDisable, false),
          eq(contract.isDisable, false),
        ),
      )
      .limit(1);

    return c.json({
      contractData: {
        ...contractData[0],
        contractRange: `${datePipe(contractData[0].from)}~${datePipe(contractData[0].to)}`,
      },
    });
  },
);

export const getAllContract = factory.createHandlers(
  zValidator(
    "query",
    z.object({
      type: z.string(),
    }),
  ),
  async (c) => {
    const { type } = c.req.valid("query");

    const contractData = await dbClient(c.env.DB)
      .select({
        id: contract.id,
        worker: workers.name,
        company: companies.name,
        sales: sales.name,
        subject: contract.subject,
        from: contract.from,
        to: contract.to,
        contractType: contract.contractType,
        paidFrom: payment.paidFrom,
        paidTo: payment.paidTo,
        document: contract.document,
        periodDate: payment.periodDate,
        workPrice: payment.workPrice,
        roundDigit: payment.roundDigit,
        roundType: payment.roundType,
        overPrice: payment.overPrice,
        underPrice: payment.underPrice,
        calcType: payment.calcType,
        isHour: payment.isHour,
        isFixed: payment.isFixed,
        salesId: sales.id,
        companyId: companies.id,
        workerId: workers.id,
        paymentId: payment.id,
        type: workersRelation.type,
      })
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
          eq(contract.isDisable, false),
          eq(sales.isDisable, false),
          eq(companies.isDisable, false),
          eq(workers.isDisable, false),
          eq(contract.isDisable, false),
          type ? eq(workersRelation.type, type) : undefined,
        ),
      )
      .all();

    return c.json(
      contractData.map((data) => ({
        ...data,
        contractRange: `${datePipe(data.from)}~${datePipe(data.to)}`,
      })),
    );
  },
);

export const getQuoteContract = factory.createHandlers(async (c) => {
  const contractData = await dbClient(c.env.DB)
    .select({
      id: contract.id,
      companyId: companies.id,
      company: companies.name,
      salesId: sales.id,
      sales: sales.name,
      workerId: workers.id,
      worker: workers.name,
      contract: {
        subject: contract.subject,
        from: contract.from,
        to: contract.to,
        contractType: contract.contractType,
        document: contract.document,
      },
      payment: {
        paidFrom: payment.paidFrom,
        paidTo: payment.paidTo,
        periodDate: payment.periodDate,
        workPrice: payment.workPrice,
        roundDigit: payment.roundDigit,
        roundType: payment.roundType,
        overPrice: payment.overPrice,
        underPrice: payment.underPrice,
        calcType: payment.calcType,
        isHour: payment.isHour,
        isFixed: payment.isFixed,
        paymentId: payment.id,
      },
      type: workersRelation.type,
    })
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
        eq(sales.isDisable, false),
        eq(companies.isDisable, false),
        eq(workers.isDisable, false),
        eq(contract.isDisable, false),
        eq(payment.isDisable, false),
      ),
    )
    .all();

  type Payment = {
    paidFrom: number;
    paidTo: number;
    periodDate: string;
    workPrice: number;
    roundDigit: number;
    roundType: string;
    overPrice: number;
    underPrice: number;
    calcType: string;
    isHour: boolean;
    isFixed: boolean;
    paymentId: number;
  };
  const defaultPayment = {
    paidFrom: 0,
    paidTo: 0,
    periodDate: "",
    workPrice: 0,
    roundDigit: 0,
    roundType: "",
    overPrice: 0,
    underPrice: 0,
    calcType: "",
    isHour: false,
    isFixed: false,
    paymentId: 0,
  };
  const res = contractData.reduce(
    (prev, curr, i) => {
      const num = prev.findIndex(({ id }) => id === curr.id);
      if (num >= 0) {
        if (curr.type === "partner") {
          if (curr.sales && curr.salesId) {
            prev[num].orderSales = curr.sales;
            prev[num].orderSalesId = curr.salesId;
          }
          if (curr.company && curr.companyId) {
            prev[num].orderCompany = curr.company;
            prev[num].orderCompanyId = curr.companyId;
          }
          prev[num].orderPayment = curr.payment;
        } else if (curr.type === "customer") {
          if (curr.sales && curr.salesId) {
            prev[num].claimSales = curr.sales;
            prev[num].claimSalesId = curr.salesId;
          }
          if (curr.company && curr.companyId) {
            prev[num].claimCompany = curr.company;
            prev[num].claimCompanyId = curr.companyId;
          }
          prev[num].claimPayment = curr.payment;
        }
      } else {
        prev[i] = {
          id: curr.id,
          ...curr.contract,
          worker: curr.worker ?? "",
          workerId: curr.workerId ?? 0,
          claimSales: curr.type === "customer" ? (curr.sales ?? "") : "",
          orderSales: curr.type === "partner" ? (curr.sales ?? "") : "",
          claimCompany: curr.type === "customer" ? (curr.company ?? "") : "",
          orderCompany: curr.type === "partner" ? (curr.company ?? "") : "",
          claimSalesId: curr.type === "customer" ? (curr.salesId ?? 0) : 0,
          orderSalesId: curr.type === "partner" ? (curr.salesId ?? 0) : 0,
          claimCompanyId: curr.type === "customer" ? (curr.companyId ?? 0) : 0,
          orderCompanyId: curr.type === "partner" ? (curr.companyId ?? 0) : 0,
          orderPayment:
            curr.type === "order"
              ? {
                  ...curr.payment,
                  periodDate: calcPeriod(curr.payment.periodDate) ?? "",
                }
              : defaultPayment,
          claimPayment:
            curr.type === "customer"
              ? {
                  ...curr.payment,
                  periodDate: calcPeriod(curr.payment.periodDate) ?? "",
                }
              : defaultPayment,
          contractRange: `${datePipe(curr.contract.from ?? new Date())}~${datePipe(curr.contract.to ?? new Date())}`,
        };
      }
      return prev.filter((data) => data);
    },
    [] as {
      id: number;
      worker: string;
      claimSales: string;
      orderSales: string;
      claimCompany: string;
      orderCompany: string;
      claimSalesId: number;
      orderSalesId: number;
      claimCompanyId: number;
      orderCompanyId: number;
      workerId: number;
      subject: string;
      contractRange: string;
      orderPayment: Payment;
      claimPayment: Payment;
    }[],
  );

  return c.json(res);
});
