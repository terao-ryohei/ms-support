import type { CalcType } from "~/types/calcType";

export function LeftData({
  isFixed,
  isHour,
  sales,
  worker,
  company,
  overPrice,
  underPrice,
  workPrice,
  paidFrom,
  paidTo,
  calcType,
}: {
  isHour: boolean;
  isFixed: boolean;
  sales: string;
  company: string;
  worker: string;
  workPrice: string;
  paidTo: number;
  paidFrom: number;
  calcType: CalcType;
  overPrice: {
    calc: string;
    comma: string;
  };
  underPrice: {
    calc: string;
    comma: string;
  };
}) {
  return (
    <div className="form-wrap mx-12 flex flex-1 flex-col rounded-lg bg-accent p-5 text-accent-foreground">
      {isHour && (
        <h2 className="mb-4 ml-2 font-bold text-3xl underline underline-offset-4">
          時間清算
        </h2>
      )}
      {isFixed && (
        <h2 className="mb-4 ml-2 font-bold text-3xl underline underline-offset-4">
          固定清算
        </h2>
      )}
      <span className="mt-2 mb-2 font-bold text-sm">顧客担当</span>
      <h2 className="mb-2 ml-2 font-bold text-xl underline underline-offset-4">
        {sales}
      </h2>
      <span className="mt-2 mb-2 font-bold text-sm">顧客</span>
      <h2 className="mb-2 ml-2 font-bold text-xl underline underline-offset-4">
        {company}
      </h2>
      <span className="mt-2 mb-2 font-bold text-sm">作業者名</span>
      <h2 className="mb-2 ml-2 font-bold text-xl underline underline-offset-4">
        {worker}
      </h2>
      {!isHour && (
        <div className="mt-auto">
          <div className="total font-bold text-lg">超過単価:</div>
          <div className="price text-right font-extrabold font-num text-2xl">
            {`${workPrice} ÷ ${calcType === "center" ? (paidTo + paidFrom) / 2 : paidTo}h = ${overPrice.calc}`}
            <br />
            {`≒ ${overPrice.comma}`}
          </div>
          <div className="total font-bold text-lg">控除単価:</div>
          <div className="price text-right font-extrabold font-num text-2xl">
            {`${workPrice} ÷ ${calcType === "center" ? (paidTo + paidFrom) / 2 : paidFrom}h = ${underPrice.calc}`}
            <br />
            {`≒ ${underPrice.comma}`}
          </div>
        </div>
      )}
    </div>
  );
}
