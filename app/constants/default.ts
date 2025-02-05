import type { CalcType } from "~/types/calcType";
import { datePipe } from "../utils/datePipe";
import type { RoundType } from "~/types/roundType";
import type { PayType } from "~/types/payType";

export const defaultData: {
  id: number;
  worker: string;
  company: string;
  sales: string;
  contractRange: string;
  paidFrom: number;
  paidTo: number;
  contractType: string;
  subject: string;
  document: string;
  payType: PayType;
  periodDate: string;
  workPrice: number;
  roundDigit: number;
  roundType: RoundType;
  calcType: CalcType;
  overPrice: number;
  underPrice: number;
  workerId: number;
  salesId: number;
  companyId: number;
} = {
  id: 0,
  worker: "",
  company: "",
  sales: "",
  contractRange: `${datePipe(new Date())}~${datePipe(new Date())}`,
  paidFrom: 140,
  paidTo: 180,
  contractType: "準委任契約",
  subject: "",
  document: "作業報告書",
  periodDate: "",
  workPrice: 500000,
  roundDigit: 1,
  roundType: "round",
  calcType: "highLow",
  overPrice: 2800,
  underPrice: 3600,
  workerId: 0,
  salesId: 0,
  companyId: 0,
  payType: "month",
};

const today = new Date();
export const defaultValue: {
  Initial: string;
  Period: string;
  ClaimFrom: string;
  ClaimTo: string;
  ContractFrom: string;
  ContractTo: string;
  PaidFrom: number;
  PaidTo: number;
  ContractType: string;
  Document: string;
  OtherPrice: number;
  WorkTime: number;
  OverTime: number;
  UnderTime: number;
  WorkPrice: number;
  OverPrice: number;
  UnderPrice: number;
  RoundType: RoundType;
  RoundDigit: number;
  CalcType: CalcType;
} = {
  Initial: "",
  Period: datePipe(new Date(today.getFullYear(), today.getMonth(), 15)),
  ClaimFrom: datePipe(new Date(today.getFullYear(), today.getMonth() - 1, 1)),
  ClaimTo: datePipe(new Date(today.getFullYear(), today.getMonth(), 0)),
  ContractFrom: datePipe(
    new Date(today.getFullYear(), today.getMonth() - 1, 1),
  ),
  ContractTo: datePipe(new Date(today.getFullYear(), today.getMonth(), 0)),
  PaidFrom: 140,
  PaidTo: 180,
  ContractType: "",
  Document: "",
  OtherPrice: 0,
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
