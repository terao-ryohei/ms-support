import { hc } from "hono/client";
import type { AppType } from "server";
import type { ClaimValues } from "server/api/claim/excel";
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
  value: ClaimValues;
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
  try {
    if (value) {
      const formData = {
        ...value,
        overPrice,
        underPrice,
        Sales: sales,
        Company: company,
        Worker: worker,
      } as ClaimValues;

      if (isHasUndefined(formData)) {
        await client.api.contract.$put({
          json: {
            id,
            values: {
              subject: value.Subject,
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

        const response = await client.api.claim.excel.$post({
          json: {
            ...formData,
            url: import.meta.env.VITE_API_URL,
            isHour: isHour,
            isFixed: isFixed,
          },
        });
        await dlBlob({
          response,
          worker: worker ?? "",
          type: "claim",
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
