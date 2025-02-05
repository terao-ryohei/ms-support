import Excel from "exceljs";
import { datePipe } from "../../../app/utils/datePipe";
import { createFactory } from "hono/factory";
import { z } from "@hono/zod-openapi";
import { zValidator } from "@hono/zod-validator";
import { calcComma } from "~/utils/price";
import type { CalcType } from "~/types/calcType";

export type RoundType = "round" | "ceil" | "floor";

export type ClaimValues = {
  Company: string; // 会社名
  Subject: string; // 件名
  Period: string; // 支払い日
  ClaimFrom: string; // 請求開始日
  ClaimTo: string; // 請求終了日
  Worker: string; // 作業担当者名
  PaidFrom: number; // 清算幅
  PaidTo: number; // 清算幅
  OtherPrice: number; // その他金額
  Sales: string; // 営業担当
  Initial: string; // イニシャル
  WorkTime: number; // 作業時間
  OverTime: number; // 超過時間
  UnderTime: number; // 控除時間
  WorkPrice: number; // 作業単価
  OverPrice: number; // 超過単価
  UnderPrice: number; // 控除単価
  RoundType: RoundType; // 丸めのタイプ
  RoundDigit: number; // 丸め桁数
  CalcType: CalcType;
  OtherItem: string;
};

const factory = createFactory<Env>();

export const createClaim = factory.createHandlers(
  zValidator(
    "json",
    z.object({
      Company: z.string(), // 会社名
      Subject: z.string(), // 件名
      Period: z.string(), // 支払い日
      ClaimFrom: z.string(), // 請求開始日
      ClaimTo: z.string(), // 請求終了日
      Worker: z.string(), // 作業担当者名
      PaidFrom: z.number(), // 清算幅
      PaidTo: z.number(), // 清算幅
      OtherPrice: z.number(), // その他金額
      Sales: z.string(), // 営業担当
      Initial: z.string(), // イニシャル
      WorkTime: z.number(), // 作業時間
      OverTime: z.number(), // 超過時間
      UnderTime: z.number(), // 控除時間
      WorkPrice: z.number(), // 作業単価
      OverPrice: z.number(), // 超過単価
      UnderPrice: z.number(), // 控除単価
      RoundType: z.string(), // 丸めのタイプ
      url: z.string(),
      RoundDigit: z.number(),
      payType: z.string(),
      OtherItem: z.string(),
    }),
  ),
  async (c) => {
    try {
      const values = c.req.valid("json");

      const [ClaimFromYear, ClaimFromMonth, ClaimFromDay] = datePipe(
        new Date(values.ClaimFrom),
      ).split("-");
      const [ClaimToYear, ClaimToMonth, ClaimToDay] = datePipe(
        new Date(values.ClaimTo),
      ).split("-");
      const [PeriodYear, PeriodMonth, PeriodDay] = datePipe(
        new Date(values.Period),
      ).split("-");

      const workbook = new Excel.Workbook();
      const response = await fetch(`${values.url}/claim.xlsx`);
      const buffer = await response.arrayBuffer();
      await workbook.xlsx.load(buffer);

      const sheet1 = workbook.worksheets[0];

      const [dtYear, dtMonth, dtDay] = new Date()
        .toLocaleDateString("ja-JP", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        })
        .split("/");

      const [dtYear2, dtMonth2] = new Date(
        Number(dtYear),
        Number(dtMonth) - 1,
        Number(dtDay),
      )
        .toLocaleDateString("ja-JP", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        })
        .split("/");

      // シート名の変更
      sheet1.name = `${dtYear2.slice(-2)}${dtMonth2}`;
      // sheet2.name = `${dtYear}${dtMonth}(別紙)`;

      // シート1の値を設定
      sheet1.getCell("F3").value =
        `御請求書番号：CMX${dtYear.slice(-2)}${dtMonth}${dtDay}_${values.Initial}`;
      sheet1.getCell("A7").value = `${values.Company} 御中`;
      sheet1.getCell("A18").value = `件 名：${values.Subject}`;
      sheet1.getCell("F18").value =
        `${PeriodYear}年${PeriodMonth}月${PeriodDay}日御支払`;

      sheet1.getCell("A24").value =
        `  ご請求期間：${ClaimFromYear}年${ClaimFromMonth}月${ClaimFromDay}日～${ClaimToYear}年${ClaimToMonth}月${ClaimToDay}日`;

      let contractHour = `${values.PaidFrom}h-${values.PaidTo}h`;
      if (values.payType === "hour") contractHour = "時給清算";
      if (values.payType === "date") contractHour = "日当清算";
      if (values.payType === "fixed") contractHour = "固定清算";

      sheet1.getCell("A25").value =
        `　　・作業担当者：${values.Worker}（${contractHour}）`;
      sheet1.getCell("E44").value =
        values.OtherItem !== "" ? values.OtherItem : "旅費交通費他";
      sheet1.getCell("G44").value = values.OtherPrice;
      sheet1.getCell("F19").value = values.Sales;

      if (
        values.payType === "date" ||
        values.payType === "hour" ||
        values.payType === "fixed"
      ) {
        sheet1.getCell("A26").value = "";
        sheet1.getCell("A27").value = "";
        sheet1.getCell("D26").value = "";
        sheet1.getCell("D27").value = "";
        sheet1.getCell("E26").value = "";
        sheet1.getCell("E27").value = "";
        sheet1.getCell("G26").value = "";
        sheet1.getCell("G27").value = "";
      }

      // シート1の請求詳細
      sheet1.getCell("C25").value = values.WorkTime;
      sheet1.getCell("C26").value =
        values.payType === "date" ||
        values.payType === "hour" ||
        values.payType === "fixed"
          ? ""
          : values.OverTime;
      sheet1.getCell("C27").value =
        values.payType === "date" ||
        values.payType === "hour" ||
        values.payType === "fixed"
          ? ""
          : values.UnderTime;
      sheet1.getCell("A26").value =
        values.payType === "date" ||
        values.payType === "hour" ||
        values.payType === "fixed"
          ? ""
          : `　　　　超過(${calcComma(values.WorkPrice)}円÷${values.PaidTo}h≒${calcComma(values.OverPrice)}円)`;
      sheet1.getCell("A27").value =
        values.payType === "date" ||
        values.payType === "hour" ||
        values.payType === "fixed"
          ? ""
          : `　　　　控除(${calcComma(values.WorkPrice)}円÷${values.PaidFrom}h≒${calcComma(values.UnderPrice)}円)`;
      sheet1.getCell("E25").value = values.WorkPrice;
      sheet1.getCell("F26").value =
        values.payType === "date" ||
        values.payType === "hour" ||
        values.payType === "fixed"
          ? ""
          : values.OverPrice;
      sheet1.getCell("F27").value =
        values.payType === "date" ||
        values.payType === "hour" ||
        values.payType === "fixed"
          ? ""
          : values.UnderPrice * -1;

      const excelBuffer = await workbook.xlsx.writeBuffer();

      // バッファをレスポンスとして返す
      return new Response(excelBuffer, {
        headers: {
          "Content-Type":
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": `attachment; filename="invoice.xlsx"`,
        },
      });
    } catch (e) {
      console.log(e);
      return new Response(null);
    }
  },
);
