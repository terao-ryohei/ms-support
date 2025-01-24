import { hc } from "hono/client";
import type { AppType } from "server";
import type { QuoteValues } from "server/api/quote/excel";
import { dlBlob } from "~/utils/dlBlob";
import { isHasUndefined } from "~/utils/typeGuard";

const client = hc<AppType>(import.meta.env.VITE_API_URL);

export const submit = async ({
  value,
  data: {
    id,
    paymentId,
    sales = "",
    company = "",
    worker = "",
    overPrice,
    underPrice,
    isFixed,
    isHour,
  },
}: {
  value: QuoteValues;
  data: {
    id: number;
    paymentId: number;
    sales: string | null;
    company: string | null;
    worker: string | null;
    overPrice: number;
    underPrice: number;
    isHour: boolean;
    isFixed: boolean;
  };
}) => {
  // APIリクエストなどの処理をここに記述
  const formData = {
    ...value,
    overPrice,
    underPrice,
    Sales: sales ?? "",
    Company: company ?? "",
    Worker: worker ?? "",
  } as QuoteValues;

  try {
    if (isHasUndefined(formData)) {
      await client.api.contract.$put({
        json: {
          id,
          values: {
            from: value.ContractFrom,
            to: value.ContractTo,
            subject: value.Subject,
            document: value.Document,
            contractType: value.ContractType,
          },
        },
      });
      await client.api.payment.$put({
        json: {
          id: paymentId,
          values: {
            workPrice: value.WorkPrice,
            paidFrom: value.PaidFrom,
            paidTo: value.PaidTo,
            roundType: value.RoundType,
            roundDigit: value.RoundDigit,
            periodDate: value.Period,
          },
        },
      });

      const from = new Date(value.ContractFrom);
      const to = new Date(value.ContractTo);

      const response = await client.api.quote.excel.$post({
        json: {
          ...formData,
          url: import.meta.env.VITE_API_URL,
          isHour: isHour,
          isFixed: isFixed,
          ContractRange:
            Number(`${to.getFullYear()}${to.getMonth()}`) -
            Number(`${from.getFullYear()}${from.getMonth()}`),
        },
      });
      await dlBlob({
        response,
        worker: worker ?? "",
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
