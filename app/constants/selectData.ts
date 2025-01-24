import type { CalcType } from "~/types/calcType";
import type { RoundType } from "~/types/roundType";

export const ROUND_OPTION: {
  id: RoundType;
  value: RoundType;
  view: string;
}[] = [
  { id: "round", value: "round", view: "四捨五入" },
  { id: "floor", value: "floor", view: "切り捨て" },
  { id: "ceil", value: "ceil", view: "切り上げ" },
];

export const CALC_OPTION: {
  id: CalcType;
  value: CalcType;
  view: string;
}[] = [
  { id: "highLow", value: "highLow", view: "上下割" },
  { id: "center", value: "center", view: "中央割" },
  { id: "other", value: "other", view: "その他" },
];
