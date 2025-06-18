import { useLoaderData } from "react-router";
import { useState, useEffect } from "react";
import { useWatch } from "react-hook-form";
import { useRemixForm } from "remix-hook-form";
import type { OrderValues } from "server/api/order/excel";
import type { RoundType } from "~/types/roundType";
import { calcPeriod } from "~/utils/calcPeriod";
import { calcPrice } from "~/utils/calcPrice";
import type { loader } from ".";
import { calcComma } from "~/utils/price";
import { submit } from "./submit";
import { defaultValue } from "~/constants/default";
import type { PayType } from "~/types/payType";

export const useHook = () => {
  const { contractData } = useLoaderData<typeof loader>();

  const { getValues, register, control, setValue } = useRemixForm<OrderValues>({
    defaultValues: {
      ...defaultValue,
      Initial: "",
      Period: calcPeriod(contractData.periodDate),
      PaidFrom: contractData.paidFrom,
      PaidTo: contractData.paidTo,
      WorkPrice: contractData.workPrice,
      RoundType: contractData.roundType as RoundType,
      RoundDigit: contractData.roundDigit,
      Subject: contractData.subject,
      Document: contractData.document,
      ContractType: contractData.contractType,
    },
  });

  const [date, setDate] = useState<(Date | undefined)[]>([
    new Date(contractData.contractRange.split("~")[0]),
    new Date(contractData.contractRange.split("~")[1]),
  ]);

  const {
    WorkPrice = 0,
    PaidFrom = 0,
    PaidTo = 0,
    RoundType: RoundTypeValue = "round",
    RoundDigit = 1,
    CalcType: CalcTypeValue = "highLow",
    OverPrice = 0,
    UnderPrice = 0,
  } = useWatch({ control });

  useEffect(() => {
    const { overPrice, underPrice } = calcPrice({
      workPrice: WorkPrice,
      from: PaidFrom,
      to: PaidTo,
      roundType: RoundTypeValue,
      roundDigit: RoundDigit,
      calcType: CalcTypeValue,
    });

    setValue("OverPrice", overPrice);
    setValue("UnderPrice", underPrice);
  }, [
    RoundTypeValue,
    WorkPrice,
    PaidFrom,
    PaidTo,
    RoundDigit,
    CalcTypeValue,
    setValue,
  ]);

  const onDateUpdate = ({
    range: { from, to },
  }: { range: { from?: Date; to?: Date } }) => {
    if (from && to) {
      setDate([from, to]);
    }
  };

  const onSubmit = () => {
    submit({
      value: getValues(),
      data: {
        ...contractData,
        overPrice: OverPrice,
        underPrice: UnderPrice,
        payType: contractData.payType as PayType,
      },
    });
  };

  const CalcPrice =
    CalcTypeValue === "center"
      ? {
          over: (WorkPrice / PaidTo).toFixed(1),
          under: (WorkPrice / PaidFrom).toFixed(1),
        }
      : {
          over: (WorkPrice / ((PaidTo + PaidFrom) / 2)).toFixed(1),
          under: (WorkPrice / ((PaidTo + PaidFrom) / 2)).toFixed(1),
        };

  return {
    contractData,
    OverPrice: {
      calc: CalcPrice.over,
      comma: calcComma(OverPrice),
    },
    UnderPrice: {
      calc: CalcPrice.under,
      comma: calcComma(UnderPrice),
    },
    date,
    WorkPrice: calcComma(WorkPrice),
    PaidFrom,
    PaidTo,
    CalcTypeValue,
    register,
    onDateUpdate,
    onSubmit,
  };
};
