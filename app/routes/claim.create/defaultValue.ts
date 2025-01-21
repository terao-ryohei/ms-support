import type { RoundType } from "server/api/claim/excel";
import type { CalcType } from "~/utils/calcPrice";
import { datePipe } from "~/utils/datePipe";

const today = new Date();

export const defaultValue = {
  Initial: "",
  Period: datePipe(new Date(today.getFullYear(), today.getMonth(), 15)),
  ClaimFrom: datePipe(new Date(today.getFullYear(), today.getMonth() - 1, 1)),
  ClaimTo: datePipe(new Date(today.getFullYear(), today.getMonth(), 0)),
  PaidFrom: 140,
  PaidTo: 180,
  OtherPrice: 0,
  Affiliate: "",
  Note: "",
  Note2: "",
  WorkTime: 1.0,
  OverTime: 0.0,
  UnderTime: 0.0,
  WorkPrice: 60,
  OverPrice: 0,
  UnderPrice: 0,
  RoundType: "round" as RoundType,
  RoundDigit: 1,
  CalcType: "highLow" as CalcType,
};
