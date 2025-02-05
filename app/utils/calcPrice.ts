import type { CalcType } from "~/types/calcType";
import type { RoundType } from "~/types/roundType";

export function calcPrice({
  workPrice,
  from,
  to,
  roundType,
  roundDigit,
  calcType,
}: {
  workPrice: number;
  from: number;
  to: number;
  roundType: RoundType;
  roundDigit: number;
  calcType: CalcType;
}) {
  let fromDivide = from;
  let toDivide = to;

  if (calcType === "center") {
    fromDivide = (Number(from) + Number(to)) / 2;
    toDivide = fromDivide;
  }

  const price = Number(String(workPrice).replaceAll(",", ""));

  const op = price / to === Number.POSITIVE_INFINITY ? 0 : price / toDivide;
  const up = price / from === Number.POSITIVE_INFINITY ? 0 : price / fromDivide;

  const digit = roundDigit;

  const opDigit = 10 ** digit;
  const upDigit = 10 ** digit;

  const opRound = Number.isNaN(op / opDigit) ? 0 : op / opDigit;
  const upRound = Number.isNaN(up / opDigit) ? 0 : up / opDigit;

  switch (roundType) {
    case "round":
      return {
        overPrice: Math.round(opRound) * opDigit,
        underPrice: Math.round(upRound) * upDigit,
      };
    case "floor":
      return {
        overPrice: Math.floor(opRound) * opDigit,
        underPrice: Math.floor(upRound) * upDigit,
      };
    default:
      return {
        overPrice: Math.ceil(opRound) * opDigit,
        underPrice: Math.ceil(upRound) * upDigit,
      };
  }
}
