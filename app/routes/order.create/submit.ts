import { hc } from "hono/client";
import type { AppType } from "server";
import type { OrderValues } from "server/api/order/excel";
import type { PayType } from "~/types/payType";
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
    payType,
  },
}: {
  value: OrderValues;
  data: {
    id: number;
    paymentId: number;
    sales: string | null;
    company: string | null;
    worker: string | null;
    overPrice: number;
    underPrice: number;
    payType: PayType;
  };
}) => {
  try {
    // APIリクエストなどの処理をここに記述
    if (value) {
      const formData = {
        ...value,
        overPrice,
        underPrice,
        Sales: sales ?? "",
        Company: company ?? "",
        Worker: worker ?? "",
      } as OrderValues;

      if (isHasUndefined(formData)) {
        await client.api.contract.$put({
          json: {
            id,
            values: {
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
              from: value.ContractFrom,
              to: value.ContractTo,
              workPrice: value.WorkPrice,
              paidFrom: value.PaidFrom,
              paidTo: value.PaidTo,
              roundType: value.RoundType,
              roundDigit: value.RoundDigit,
              periodDate: value.Period,
            },
          },
        });

        const response = await client.api.order.excel.$post({
          json: {
            ...formData,
            url: import.meta.env.VITE_API_URL,
            payType: payType,
          },
        });
        await dlBlob({
          response,
          worker: worker ?? "",
          type: "order",
        });
      } else {
        alert("フォームを埋めてください");
      }
    } else {
      alert("フォームを埋めてください");
    }
  } catch (error) {
    console.error("Form submission error:", error);
    alert("予期せぬエラーです");
  }
};
