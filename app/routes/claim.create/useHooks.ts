import { useLoaderData } from "@remix-run/react";
import { useEffect } from "react";
import { useWatch } from "react-hook-form";
import { useRemixForm } from "remix-hook-form";
import type { ClaimValues } from "server/api/claim/excel";
import { defaultValue } from "~/constants/default";
import type { CalcType } from "~/types/calcType";
import type { RoundType } from "~/types/roundType";
import { calcPeriod } from "~/utils/calcPeriod";
import { calcPrice } from "~/utils/calcPrice";
import { datePipe } from "~/utils/datePipe";
import { calcComma } from "~/utils/price";
import type { loader } from ".";
import { submit } from "./submit";

export const useHook = () => {
  const today = new Date();
  const { contractData } = useLoaderData<typeof loader>();

  const { getValues, register, control, setValue } = useRemixForm<ClaimValues>({
    defaultValues: {
      ...defaultValue,
      Initial: "",
      Period: calcPeriod(contractData.periodDate),
      ClaimFrom: datePipe(
        new Date(today.getFullYear(), today.getMonth() - 1, 1),
      ),
      ClaimTo: datePipe(new Date(today.getFullYear(), today.getMonth(), 0)),
      PaidFrom: contractData.paidFrom,
      PaidTo: contractData.paidTo,
      OtherPrice: 0,
      WorkTime: 1.0,
      OverTime: 0.0,
      UnderTime: 0.0,
      OverPrice: contractData.overPrice,
      UnderPrice: contractData.underPrice,
      WorkPrice: contractData.workPrice,
      RoundType: contractData.roundType as RoundType,
      CalcType: contractData.calcType as CalcType,
      RoundDigit: contractData.roundDigit,
      Subject: contractData.subject,
    },
  });

  const {
    WorkPrice = 0,
    PaidFrom = 0,
    PaidTo = 0,
    OverPrice = 0,
    UnderPrice = 0,
    RoundType: RoundTypeValue = "round",
    RoundDigit = 1,
    CalcType: CalcTypeValue = "highLow",
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

  const onSubmit = () => {
    submit({
      value: getValues(),
      data: {
        ...contractData,
        overPrice: OverPrice,
        underPrice: UnderPrice,
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
    WorkPrice: calcComma(WorkPrice),
    PaidFrom,
    PaidTo,
    CalcTypeValue,
    register,
    onSubmit,
  };
};
