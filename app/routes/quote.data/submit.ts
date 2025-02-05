import type { Row } from "@tanstack/react-table";
import { hc } from "hono/client";
import type { AppType } from "server";
import type { QuoteValues } from "server/api/quote/excel";
import type { RoundType } from "~/types/roundType";
import { calcPeriod } from "~/utils/calcPeriod";
import { calcPrice } from "~/utils/calcPrice";
import { datePipe } from "~/utils/datePipe";
import { dlBlob } from "~/utils/dlBlob";
import { isHasUndefined } from "~/utils/typeGuard";

const client = hc<AppType>(import.meta.env.VITE_API_URL);

export const onSubmit = async <T>({
  row,
  roundType,
  roundDigit,
  initial,
}: {
  row: Row<T>;
  roundType: RoundType;
  roundDigit: number;
  initial: string;
}) => {
  try {
    const today = new Date();
    const from = new Date(
      String(row.getValue("contractRange") ?? "").split("~")[0],
    );
    const to = new Date(
      String(row.getValue("contractRange") ?? "").split("~")[1],
    );
    const { overPrice, underPrice } = calcPrice({
      workPrice: row.getValue("workPrice"),
      from: row.getValue("paidFrom"),
      to: row.getValue("paidTo"),
      roundType,
      roundDigit,
      calcType: row.getValue("calcType"),
    });

    const req = {
      Company: row.getValue("company"),
      Subject: row.getValue("subject"),
      Period: calcPeriod(row.getValue("periodDate")),
      ContractFrom: datePipe(
        new Date(from.getFullYear(), from.getMonth(), from.getDate()),
      ),
      ContractTo: datePipe(
        new Date(to.getFullYear(), to.getMonth(), to.getDate()),
      ),
      ClaimFrom: datePipe(
        new Date(today.getFullYear(), today.getMonth() - 1, 1),
      ),
      ClaimTo: datePipe(new Date(today.getFullYear(), today.getMonth(), 0)),
      ContractRange:
        Number(`${to.getFullYear()}${to.getMonth()}`) -
        Number(`${from.getFullYear()}${from.getMonth()}`),
      Worker: row.getValue("worker"),
      PaidFrom: row.getValue("paidFrom"),
      PaidTo: row.getValue("paidTo"),
      Sales: row.getValue("sales"),
      Initial: initial,
      Document: row.getValue("document"),
      ContractType: row.getValue("contractType"),
      WorkPrice: row.getValue("workPrice"),
      OverPrice: overPrice,
      UnderPrice: underPrice,
      RoundType: roundType,
      RoundDigit: roundDigit,
      CalcType: row.getValue("calcType"),
    } as QuoteValues;

    if (isHasUndefined(req)) {
      const response = await client.api.quote.excel.$post({
        json: {
          ...req,
          url: import.meta.env.VITE_API_URL,
          payType: row.getValue("payType"),
        },
      });
      await dlBlob({
        response,
        worker: row.getValue("worker") ?? "",
        type: "quote",
      });
    } else {
      alert("フォームを埋めてください");
    }
  } catch (error) {
    console.error("Form submission error:", error);
    alert("予期せぬエラーです");
  }
};
