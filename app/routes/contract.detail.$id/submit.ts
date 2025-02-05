import { hc } from "hono/client";
import type { AppType } from "server";
import type { CalcType } from "~/types/calcType";
import type { PayType } from "~/types/payType";
import type { RoundType } from "~/types/roundType";

const client = hc<AppType>(import.meta.env.VITE_API_URL);

export const onSubmit = async ({
  sales,
  company,
  worker,
  contractRange,
  values,
  id,
  paymentId,
}: {
  sales: { claim: number; order: number };
  company: { claim: number; order: number };
  worker: number;
  contractRange: string;
  id: number;
  paymentId: { claim: number; order: number };
  values: {
    ClaimPeriod: string;
    ClaimPaidFrom: number;
    ClaimPaidTo: number;
    ClaimWorkPrice: number;
    ClaimCalcType: CalcType;
    ClaimRoundType: RoundType;
    ClaimPayType: PayType;
    ClaimRoundDigit: number;
    ClaimOverPrice: number;
    ClaimUnderPrice: number;
    OrderPeriod: string;
    OrderPaidFrom: number;
    OrderPaidTo: number;
    OrderWorkPrice: number;
    OrderCalcType: CalcType;
    OrderRoundType: RoundType;
    OrderPayType: PayType;
    OrderRoundDigit: number;
    OrderOverPrice: number;
    OrderUnderPrice: number;
    Subject: string;
    Document: string;
    ContractType: string;
  };
}) => {
  await client.api.relation.$put({
    json: {
      id,
      mode: "all",
      type: "workerId",
      value: worker,
    },
  });
  await client.api.relation.$put({
    json: {
      id,
      mode: "customer",
      type: "salesId",
      value: sales.claim,
    },
  });
  await client.api.relation.$put({
    json: {
      id,
      mode: "partner",
      type: "salesId",
      value: sales.order,
    },
  });
  await client.api.relation.$put({
    json: {
      id,
      mode: "customer",
      type: "companyId",
      value: company.claim,
    },
  });
  await client.api.relation.$put({
    json: {
      id,
      mode: "partner",
      type: "companyId",
      value: company.order,
    },
  });
  await client.api.contract.$put({
    json: {
      id,
      values: {
        contractType: values.ContractType,
        subject: values.Subject,
        document: values.Document,
      },
    },
  });
  await client.api.payment.$put({
    json: {
      values: {
        from: contractRange.split("~")[0],
        to: contractRange.split("~")[1],
        paidFrom: values.ClaimPaidFrom,
        paidTo: values.ClaimPaidTo,
        periodDate: values.ClaimPeriod,
        workPrice: values.ClaimWorkPrice,
        roundDigit: values.ClaimRoundDigit,
        roundType: values.ClaimRoundType,
        calcType: values.ClaimCalcType,
        overPrice: values.ClaimOverPrice,
        underPrice: values.ClaimUnderPrice,
        payType: values.ClaimPayType,
      },
      id: paymentId.claim,
    },
  });
  await client.api.payment.$put({
    json: {
      values: {
        paidFrom: values.OrderPaidFrom,
        paidTo: values.OrderPaidTo,
        periodDate: values.OrderPeriod,
        workPrice: values.OrderWorkPrice,
        roundDigit: values.OrderRoundDigit,
        roundType: values.OrderRoundType,
        calcType: values.OrderCalcType,
        overPrice: values.OrderOverPrice,
        underPrice: values.OrderUnderPrice,
        payType: values.OrderPayType,
      },
      id: paymentId.order,
    },
  });
};
