import { useLoaderData } from "@remix-run/react";
import { useEffect, useState } from "react";
import { useWatch } from "react-hook-form";
import { useRemixForm } from "remix-hook-form";
import type { RoundType } from "server/api/claim/excel";
import type { OrderValues } from "server/api/order/excel";
import { DateRangePicker } from "~/components/date-picker/date-range-picker";
import { Input } from "~/components/input/input";
import { Select } from "~/components/input/select";
import { calcPeriod } from "~/utils/calcPeriod";
import { calcPrice } from "~/utils/calcPrice";
import { calcComma } from "~/utils/price";
import { defaultValue } from "./defaultValue";
import { contractLoader } from "./loader";
import { submit } from "./submit";

export const loader = contractLoader;

export default function Index() {
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
    CalcType = "highLow",
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
      calcType: CalcType,
    });

    setValue("OverPrice", overPrice);
    setValue("UnderPrice", underPrice);
  }, [
    RoundTypeValue,
    WorkPrice,
    PaidFrom,
    PaidTo,
    RoundDigit,
    CalcType,
    setValue,
  ]);

  return (
    <div className="container mx-auto px-4">
      <h1 className="mb-5 text-left font-bold text-3xl">注文書作成装置</h1>
      <div className="flex gap-2">
        <div className="form-wrap mx-12 flex flex-1 flex-col rounded-lg bg-gray-800 p-5 text-white">
          {contractData.isHour && (
            <h2 className="mb-4 ml-2 font-bold text-3xl underline underline-offset-4">
              時間清算
            </h2>
          )}
          {contractData.isFixed && (
            <h2 className="mb-4 ml-2 font-bold text-3xl underline underline-offset-4">
              固定清算
            </h2>
          )}
          <span className="mt-2 mb-2 font-bold text-sm">要員担当</span>
          <h2 className="mb-2 ml-2 font-bold text-xl underline underline-offset-4">
            {contractData?.sales}
          </h2>
          <span className="mt-2 mb-2 font-bold text-sm">所属</span>
          <h2 className="mb-2 ml-2 font-bold text-xl underline underline-offset-4">
            {contractData?.company}
          </h2>
          <span className="mt-2 mb-2 font-bold text-sm">作業者名</span>
          <h2 className="mb-2 ml-2 font-bold text-xl underline underline-offset-4">
            {contractData?.worker}
          </h2>
          {!contractData.isHour && (
            <div className="mt-auto">
              {CalcType === "center" || CalcType === "fixed" ? (
                <>
                  <div className="total font-bold text-lg">超過控除単価:</div>
                  {CalcType === "center" && (
                    <div className="price text-right font-extrabold font-num text-2xl">
                      {`${calcComma(WorkPrice)} ÷ ${(PaidTo + PaidFrom) / 2}h = ${(WorkPrice / ((PaidTo + PaidFrom) / 2)).toFixed(1)}`}
                      <br />
                      {`≒ ${calcComma(OverPrice)}`}
                    </div>
                  )}
                  {CalcType === "fixed" && (
                    <div className="price text-right font-extrabold font-num text-2xl">
                      {`${calcComma(WorkPrice)} ÷ 160h = ${(WorkPrice / 160).toFixed(1)}`}
                      <br />
                      {`≒ ${calcComma(OverPrice)}`}
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="total font-bold text-lg">超過単価:</div>
                  <div className="price text-right font-extrabold font-num text-2xl">
                    {`${calcComma(WorkPrice)} ÷ ${PaidTo}h = ${(WorkPrice / PaidTo).toFixed(1)}`}
                    <br />
                    {`≒ ${calcComma(OverPrice)}`}
                  </div>
                  <div className="total font-bold text-lg">控除単価:</div>
                  <div className="price text-right font-extrabold font-num text-2xl">
                    {`${calcComma(WorkPrice)} ÷ ${PaidFrom}h = ${(WorkPrice / PaidFrom).toFixed(1)}`}
                    <br />
                    {`≒ ${calcComma(UnderPrice)}`}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
        <div className="form-wrap flex flex-1 flex-col rounded-lg bg-gray-100 p-5">
          <span className="mt-2 mb-2 font-bold text-sm">
            請求書作成者イニシャル
          </span>
          <Input
            register={register("Initial")}
            inputMode="url"
            placeholder="A"
          />
          <span className="mt-2 mb-2 font-bold text-sm">件名</span>
          <Input register={register("Subject")} placeholder="開発業務" />
          <span className="mt-2 mb-2 font-bold text-sm">支払期日</span>
          <Input
            register={register("Period")}
            placeholder="月末締め翌々月15日御支払"
          />
          <span className="mt-2 mb-2 font-bold text-sm">契約期間</span>
          <div className="mb-2 w-full">
            <DateRangePicker
              initialDateFrom={date[0]}
              initialDateTo={date[1]}
              onUpdate={({ range: { from, to } }) => {
                if (from && to) {
                  setDate([from, to]);
                }
              }}
            />
          </div>
          <span className="mt-2 mb-2 font-bold text-sm">基準時間(h)</span>
          <div className="range mb-5 flex items-center gap-2">
            <Input
              register={register("PaidFrom", { valueAsNumber: true })}
              type="number"
              inputMode="numeric"
              placeholder="140"
              disable={contractData.isFixed}
            />
            ~
            <Input
              register={register("PaidTo", { valueAsNumber: true })}
              type="number"
              inputMode="numeric"
              placeholder="180"
            />
          </div>
          <div className="mb-5 grid grid-cols-3 gap-5">
            <div className="flex flex-col">
              <span className="mb-2 font-bold text-sm">出単価(万)</span>
              <Input
                register={register("WorkPrice", { valueAsNumber: true })}
                type="number"
                inputMode="numeric"
                placeholder="60"
              />
            </div>
            <div className="flex flex-col">
              <span className="mb-2 font-bold text-sm">端数処理</span>
              <Select
                register={register("RoundType")}
                data={[
                  { id: "round", value: "round", view: "四捨五入" },
                  { id: "floor", value: "floor", view: "切り捨て" },
                  { id: "ceil", value: "ceil", view: "切り上げ" },
                ]}
                disable={contractData.isFixed}
              />
            </div>
            <div className="flex flex-col">
              <span className="mb-2 font-bold text-sm">端数処理桁数</span>
              <Input
                register={register("RoundDigit", { valueAsNumber: true })}
                type="number"
                inputMode="numeric"
                placeholder="1"
                disable={contractData.isFixed}
              />
            </div>
          </div>
          <div className="mb-5 grid grid-cols-3 gap-5">
            <div className="flex flex-col">
              <span className="mb-2 font-bold text-sm">超過控除の計算</span>
              <Select
                register={register("CalcType")}
                data={[
                  { id: "highLow", value: "highLow", view: "上下割" },
                  { id: "center", value: "center", view: "中央割" },
                  { id: "other", value: "other", view: "その他" },
                ]}
                disable={contractData.isFixed}
              />
            </div>
            <div className="flex flex-col">
              <span className="mb-2 font-bold text-sm">超過単価</span>
              <Input
                register={register("OverPrice")}
                type="number"
                inputMode="numeric"
              />
            </div>
            <div className="flex flex-col">
              <span className="mb-2 font-bold text-sm">控除単価</span>
              <Input
                register={register("UnderPrice")}
                type="number"
                inputMode="numeric"
              />
            </div>
          </div>
          <div className="mb-5 grid grid-cols-2 gap-5">
            <div className="flex flex-col">
              <span className="mt-2 mb-2 font-bold text-sm">成果物</span>
              <Input register={register("Document")} placeholder="作業報告書" />
            </div>
            <div className="flex flex-col">
              <span className="mt-2 mb-2 font-bold text-sm">契約形態</span>
              <Input
                register={register("ContractType")}
                placeholder="業務委託"
              />
            </div>
          </div>
          <button
            type="button"
            className="mt-5 h-14 rounded-md bg-teal-500 px-4 py-2 font-bold text-white shadow-md hover:bg-teal-600"
            onClick={() => {
              submit(getValues(), {
                ...contractData,
                overPrice: OverPrice,
                underPrice: UnderPrice,
              });
            }}
          >
            Excelを出力する
          </button>
        </div>
      </div>
    </div>
  );
}
