import { z } from "@hono/zod-openapi";
import { zValidator } from "@hono/zod-validator";
import Excel from "exceljs";
import { createFactory } from "hono/factory";
import type { CalcType } from "~/types/calcType";
import { calcComma } from "~/utils/price";
import { datePipe } from "../../../app/utils/datePipe";

export type RoundType = "round" | "ceil" | "floor";

export type QuoteValues = {
  Company: string; // 会社名
  Subject: string; // 件名
  Period: string; // 支払い日
  Worker: string; // 作業担当者名
  PaidFrom: number; // 清算幅
  PaidTo: number; // 清算幅
  Sales: string; // 営業担当
  Initial: string; // イニシャル
  WorkPrice: number; // 作業単価
  OverPrice: number; // 超過単価
  UnderPrice: number; // 控除単価
  RoundType: RoundType; // 丸めのタイプ
  RoundDigit: number; // 丸め桁数
  Document: string; // 成果物
  ContractType: string; // 契約形態
  ContractFrom: string; // 契約開始日
  ContractTo: string; // 契約終了日
  CalcType: CalcType;
  ContractRange: number;
};

const factory = createFactory<Env>();

export const createQuote = factory.createHandlers(
  zValidator(
    "json",
    z.object({
      Company: z.string(), // 会社名
      Subject: z.string(), // 件名
      Period: z.string(), // 支払い日
      ContractFrom: z.string(), // 契約開始日
      ContractTo: z.string(), // 契約終了日
      ContractRange: z.number(),
      Worker: z.string(), // 作業担当者名
      PaidFrom: z.number(), // 清算幅
      PaidTo: z.number(), // 清算幅
      Sales: z.string(), // 営業担当
      Initial: z.string(), // イニシャル
      WorkPrice: z.number(), // 作業単価
      OverPrice: z.number(), // 超過単価
      UnderPrice: z.number(), // 控除単価
      RoundType: z.string(), // 丸めのタイプ
      Document: z.string(), // 成果物
      ContractType: z.string(), // 契約形態
      url: z.string(),
      RoundDigit: z.number(),
      isHour: z.boolean(),
      isFixed: z.boolean(),
      CalcType: z.string(),
    }),
  ),
  async (c) => {
    try {
      const values = c.req.valid("json");

      const [ContractFromYear, ContractFromMonth, ContractFromDay] = datePipe(
        new Date(values.ContractFrom),
      ).split("-");
      const [ContractToYear, ContractToMonth, ContractToDay] = datePipe(
        new Date(values.ContractTo),
      ).split("-");
      const [PeriodYear, PeriodMonth, PeriodDay] = datePipe(
        new Date(values.Period),
      ).split("-");

      const workbook = new Excel.Workbook();
      const response = await fetch(`${values.url}/quote.xlsx`);
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

      const [_, dtMonth2] = new Date(
        Number(dtYear),
        Number(dtMonth) + values.ContractRange,
        Number(dtDay),
      )
        .toLocaleDateString("ja-JP", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        })
        .split("/");

      // シート名の変更
      sheet1.name = `${dtYear.slice(-2)}-${dtMonth}${dtMonth2}`;
      // sheet2.name = `${dtYear}${dtMonth}(別紙)`;

      // シート1の値を設定
      sheet1.getCell("S1").value = `${dtYear}/${dtMonth}/${dtDay}`;
      sheet1.getCell("R2").value =
        `御見積書番号：CMX${dtYear.slice(-2)}${dtMonth}${dtDay}_${values.Initial}`;
      sheet1.getCell("A6").value = `${values.Company}　御中`;
      sheet1.getCell("A22").value = `件　名　：${values.Subject}`;
      sheet1.getCell("A23").value = `（契約形態：${values.ContractType}）`;
      sheet1.getCell("R19").value =
        `　${PeriodYear}年${PeriodMonth}月${PeriodDay}日御支払`;

      sheet1.getCell("B26").value = ContractFromYear;
      sheet1.getCell("D26").value = ContractFromMonth;
      sheet1.getCell("F26").value = ContractFromDay;
      sheet1.getCell("I26").value = ContractToYear;
      sheet1.getCell("K26").value = ContractToMonth;
      sheet1.getCell("M26").value = ContractToDay;

      let contractHour = `${(values.PaidFrom + values.PaidTo) / 2}±${(values.PaidFrom + values.PaidTo) / 2 - values.PaidFrom}`;
      if (values.isHour) contractHour = "時間清算";
      if (values.isFixed) contractHour = "固定清算";

      sheet1.getCell("B27").value = values.Worker;
      sheet1.getCell("E27").value = `（${contractHour}）`;
      sheet1.getCell("R11").value = `担者：${values.Sales}`;

      // シート1の請求詳細
      sheet1.getCell("R27").value = values.WorkPrice;
      sheet1.getCell("P27").value =
        values.ContractRange < 1 ? 1 : values.ContractRange;

      let paidHour = `${values.PaidFrom}h～${values.PaidTo}h`;
      if (values.isFixed) paidHour = "160h";
      sheet1.getCell("C35").value =
        `基準時間を${paidHour}とし、稼働時間の過不足単価は、`;

      let roundType = "四捨五入";
      if (values.RoundType === "cail") roundType = "切上げ";
      if (values.RoundType === "floor") roundType = "切捨て";
      let priceExplain = `超過：${calcComma(values.OverPrice)}、控除：${calcComma(values.UnderPrice)}（${values.WorkPrice}円÷${values.PaidTo}h、${values.WorkPrice}円÷${values.PaidFrom}h、${10 ** (String(values.OverPrice).split(".")[0].length - values.RoundDigit)}円未満${roundType}）`;
      if (values.CalcType === "center")
        priceExplain = `超過控除：${calcComma(values.OverPrice)}（${calcComma(values.WorkPrice)}÷${(values.PaidFrom + values.PaidTo) / 2}h、${10 ** (String(values.OverPrice).split(".")[0].length - values.RoundDigit)}円未満${roundType}）`;
      if (values.CalcType === "other")
        priceExplain = `超過：${calcComma(values.OverPrice)}、控除：${calcComma(values.UnderPrice)}（${10 ** (String(values.OverPrice).split(".")[0].length - values.RoundDigit)}円未満${roundType}）`;
      sheet1.getCell("C36").value = priceExplain;

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
