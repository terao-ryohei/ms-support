import type { Row } from "@tanstack/react-table";
import { hc } from "hono/client";
import type { ClaimValues } from "server/api/claim/excel";
import type { AppType } from "server";
import type { RoundType } from "~/types/roundType";
import { calcPeriod } from "~/utils/calcPeriod";
import { calcPrice } from "~/utils/calcPrice";
import { dlBlob } from "~/utils/dlBlob";
import { isHasUndefined } from "~/utils/typeGuard";

const client = hc<AppType>(import.meta.env.VITE_API_URL);

export const onSubmit = async <T>({
  row,
  roundType,
  roundDigit,
  initial,
  from,
  to,
}: {
  row: Row<T>;
  roundType: RoundType;
  roundDigit: number;
  initial: string;
  from: string;
  to: string;
}) => {
  try {
    const { overPrice, underPrice } = calcPrice({
      workPrice: row.getValue("workPrice"),
      from: row.getValue("paidFrom"),
      to: row.getValue("paidTo"),
      roundType: roundType as RoundType,
      roundDigit: roundDigit,
      calcType: row.getValue("calcType"),
    });

    const req = {
      Company: row.getValue("company"),
      Subject: row.getValue("subject"),
      Period: calcPeriod(row.getValue("periodDate")),
      ClaimFrom: from,
      ClaimTo: to,
      Worker: row.getValue("worker"),
      PaidFrom: row.getValue("paidFrom"),
      PaidTo: row.getValue("paidTo"),
      Sales: row.getValue("sales"),
      Initial: initial,
      WorkTime: 1.0,
      OverTime: 0.0,
      UnderTime: 0.0,
      OtherPrice: 0,
      OtherItem: "",
      WorkPrice: row.getValue("workPrice"),
      OverPrice: overPrice,
      UnderPrice: underPrice,
      RoundType: roundType,
      RoundDigit: roundDigit,
    } as ClaimValues;

    if (isHasUndefined(req)) {
      const response = await client.api.claim.excel.$post({
        json: {
          ...req,
          url: import.meta.env.VITE_API_URL,
          payType: row.getValue("payType"),
        },
      });
      await dlBlob({
        response,
        worker: row.getValue("worker") ?? "",
        type: "claim",
      });
    } else {
      alert("フォームを埋めてください");
    }
  } catch (error) {
    console.error("Form submission error:", error);
    alert("予期せぬエラーです");
  }
};
