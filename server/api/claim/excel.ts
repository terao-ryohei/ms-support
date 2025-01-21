import Excel from "exceljs";
import { datePipe } from "../../../app/utils/datePipe";
import { createFactory } from "hono/factory";
import { z } from "@hono/zod-openapi";
import { zValidator } from "@hono/zod-validator";
import { calcComma } from "~/utils/price";
import type { CalcType } from "~/utils/calcPrice";

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
  Affiliate: string; // 関連会社名
  Note: string; // 備考
  Note2: string; // 備考2
  WorkTime: number; // 作業時間
  OverTime: number; // 超過時間
  UnderTime: number; // 控除時間
  WorkPrice: number; // 作業単価
  OverPrice: number; // 超過単価
  UnderPrice: number; // 控除単価
  RoundType: RoundType; // 丸めのタイプ
  RoundDigit: number; // 丸め桁数
  CalcType: CalcType;
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
      Affiliate: z.string(), // 関連会社名
      Note: z.string(), // 備考
      Note2: z.string(), // 備考2
      WorkTime: z.number(), // 作業時間
      OverTime: z.number(), // 超過時間
      UnderTime: z.number(), // 控除時間
      WorkPrice: z.number(), // 作業単価
      OverPrice: z.number(), // 超過単価
      UnderPrice: z.number(), // 控除単価
      RoundType: z.string(), // 丸めのタイプ
      url: z.string(),
      RoundDigit: z.number(),
      isHour: z.boolean(),
      isFixed: z.boolean(),
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
      // const sheet2 = workbook.worksheets[1];

      const image = workbook.addImage({
        base64:
          "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",
        extension: "png",
      });
      sheet1.addImage(image, {
        tl: { col: 6, row: 7 },
        ext: { width: 96.76, height: 97.89 },
      });

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
      if (values.isHour) contractHour = "時間清算";
      if (values.isFixed) contractHour = "固定清算";

      sheet1.getCell("A25").value =
        `　　・作業担当者：${values.Worker}（${contractHour}）`;
      sheet1.getCell("G44").value = values.OtherPrice;
      sheet1.getCell("F19").value = values.Sales;

      if (values.isHour || values.isFixed) {
        sheet1.getCell("A26").value = "";
        sheet1.getCell("A27").value = "";
        sheet1.getCell("D26").value = "";
        sheet1.getCell("D27").value = "";
        sheet1.getCell("E26").value = "";
        sheet1.getCell("E27").value = "";
        sheet1.getCell("G26").value = "";
        sheet1.getCell("G27").value = "";
      }

      // シート2の値を設定
      // sheet2.getCell("B6").value = values.Company;
      // sheet2.getCell("B14").value = values.Affiliate;

      // sheet2.getCell("B15").value =
      //   `${dtYear}年${ClaimFromMonth}月${ClaimFromDay}日～${dtYear}年${ClaimToMonth}月${ClaimToDay}日`;

      // sheet2.getCell("B16").value =
      //   `${values.Worker}（${values.PaidFrom}h-${values.PaidTo}h）`;
      // sheet2.getCell("A7").value = values.Note;
      // sheet2.getCell("A20").value = values.Note2;

      // シート1の請求詳細
      sheet1.getCell("C25").value = values.WorkTime;
      sheet1.getCell("C26").value =
        values.isHour || values.isFixed ? "" : values.OverTime;
      sheet1.getCell("C27").value =
        values.isHour || values.isFixed ? "" : values.UnderTime;
      sheet1.getCell("A26").value =
        values.isHour || values.isFixed
          ? ""
          : `　　　　超過(${calcComma(values.WorkPrice)}円÷${values.PaidTo}h≒${calcComma(values.OverPrice)}円)`;
      sheet1.getCell("A27").value =
        values.isHour || values.isFixed
          ? ""
          : `　　　　控除(${calcComma(values.WorkPrice)}円÷${values.PaidFrom}h≒${calcComma(values.UnderPrice)}円)`;
      sheet1.getCell("E25").value = values.WorkPrice;
      sheet1.getCell("F26").value =
        values.isHour || values.isFixed ? "" : values.OverPrice;
      sheet1.getCell("F27").value =
        values.isHour || values.isFixed ? "" : values.UnderPrice * -1;

      // シート2の請求詳細
      // sheet2.getCell("C16").value = values.WorkTime;
      // sheet2.getCell("C17").value = values.OverTime;
      // sheet2.getCell("C18").value = values.UnderTime;
      // sheet2.getCell("E16").value = values.WorkPrice;
      // sheet2.getCell("F17").value = calculatePrice(
      //   Number(values.WorkPrice),
      //   values.PaidTo,
      //   values.RoundType,
      // );
      // sheet2.getCell("F18").value =
      //   calculatePrice(
      //     Number(values.WorkPrice),
      //     values.PaidFrom,
      //     values.RoundType,
      //   ) * -1;
      // sheet2.getCell("G16").value =
      //   Number(values.WorkTime) * Number(values.WorkPrice);
      // sheet2.getCell("G17").value =
      //   Number(values.OverTime) * Number(sheet2.getCell("F17").value);
      // sheet2.getCell("G18").value =
      //   Number(values.UnderTime) * Number(sheet2.getCell("F18").value);

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
