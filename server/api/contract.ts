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

export const getContractAndPayment = factory.createHandlers(async (c) => {
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
