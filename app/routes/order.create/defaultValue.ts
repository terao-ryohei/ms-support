import type { RoundType } from "server/api/claim/excel";
import type { CalcType } from "~/utils/calcPrice";
import { datePipe } from "~/utils/datePipe";

const today = new Date();

export const defaultValue = {
  Initial: "",
  Period: "",
  ContractFrom: datePipe(
    new Date(today.getFullYear(), today.getMonth() - 1, 1),
  ),
  ContractTo: datePipe(new Date(today.getFullYear(), today.getMonth(), 0)),
  PaidFrom: 140,
  PaidTo: 180,
  ContractType: "",
  Document: "",
  WorkPrice: 60,
  RoundType: "round" as RoundType,
  RoundDigit: 1,
  OverPrice: 0,
  UnderPrice: 0,
  CalcType: "highLow" as CalcType,
};
