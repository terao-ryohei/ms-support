import { createFactory } from "hono/factory";
import {
  companies,
  contract,
  payment,
  sales,
  workers,
  workersRelation,
} from "../../drizzle/schema";
import { dbClient } from "server";

const factory = createFactory<Env>();

// サンプルデータ挿入用のヘルパー関数
export const insertSampleData = factory.createHandlers(async (c) => {
  // Sales テーブルのデータ
  await dbClient(c.env.DB)
    .insert(sales)
    .values([
      { name: "Q1 Sales", isDisable: false },
      { name: "Q2 Sales", isDisable: false },
      { name: "Q3 Sales", isDisable: false },
    ]);

  // Companies テーブルのデータ
  await dbClient(c.env.DB)
    .insert(companies)
    .values([
      { name: "TechCorp", isDisable: false },
      { name: "EduVision", isDisable: false },
      { name: "HealthSolutions", isDisable: false },
    ]);

  // Workers テーブルのデータ
  await dbClient(c.env.DB)
    .insert(workers)
    .values([
      { name: "Alice", isDisable: false },
      { name: "Bob", isDisable: false },
      { name: "Charlie", isDisable: false },
    ]);

  // Contract テーブルのデータ
  await dbClient(c.env.DB)
    .insert(contract)
    .values([
      {
        isDisable: false,
        from: new Date(),
        to: new Date(),
        contractType: "業務委託",
        subject: "開発",
        document: "勤怠",
      },
      {
        isDisable: false,
        from: new Date(),
        to: new Date(),
        contractType: "準委任",
        subject: "テスト",
        document: "設計書",
      },
    ]);

  // Payment テーブルのデータ
  await dbClient(c.env.DB)
    .insert(payment)
    .values([
      {
        paidTo: 100,
        paidFrom: 180,
        isHour: false,
        isDisable: false,
        periodDate: "15s",
        workPrice: 1200,
        roundDigit: 0,
        roundType: "round",
        calcType: "center",
        overPrice: 0,
        underPrice: 0,
        isFixed: false,
      },
      {
        paidTo: 102200,
        paidFrom: 30,
        isHour: false,
        isDisable: false,
        periodDate: "15s",
        workPrice: 1200,
        roundDigit: 0,
        roundType: "round",
        calcType: "center",
        overPrice: 0,
        underPrice: 0,
        isFixed: false,
      },
    ]);

  // // Affiliations テーブルのデータ
  // await dbClient(c.env.DB)
  //   .insert(affiliations)
  //   .values([{ name: "Marketing" }, { name: "Engineering" }, { name: "HR" }]);

  // WorkersRelation 中間テーブルのデータ
  await dbClient(c.env.DB)
    .insert(workersRelation)
    .values([
      {
        companyId: 1,
        workerId: 1,
        salesId: 1,
        contractId: 1,
        paymentId: 1,
        type: "partner",
      },
      {
        companyId: 1,
        workerId: 1,
        salesId: 1,
        contractId: 1,
        paymentId: 2,
        type: "customer",
      },
    ]);

  // // WorkersAffiliations 中間テーブルのデータ
  // await dbClient(c.env.DB)
  //   .insert(workersAffiliations)
  //   .values([
  //     { workersId: 1, affiliationId: 1 },
  //     { workersId: 2, affiliationId: 2 },
  //   ]);

  // SalesCompanies 中間テーブルのデータ

  // // Initial テーブルのデータ
  // await dbClient(c.env.DB)
  //   .insert(initial)
  //   .values([{ initial: "A" }, { initial: "B" }]);
});
