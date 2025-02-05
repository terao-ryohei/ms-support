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
  claimContractRange,
  orderContractRange,
  values,
}: {
  sales: { claim: number; order: number };
  company: { claim: number; order: number };
  worker: number;
  claimContractRange: string;
  orderContractRange: string;
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
  await client.api.contract.payment.$post({
    json: {
      workerId: worker,
      claimCompanyId: company.claim,
      claimSalesId: sales.claim,
      orderCompanyId: company.order,
      orderSalesId: sales.order,
      contract: {
        contractType: values.ContractType,
        subject: values.Subject,
        document: values.Document,
      },
      claimPayment: {
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
        from: claimContractRange.split("~")[0],
        to: claimContractRange.split("~")[1],
      },
      orderPayment: {
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
        from: orderContractRange.split("~")[0],
        to: orderContractRange.split("~")[1],
      },
    },
  });
};
