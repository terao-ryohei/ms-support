import type { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";
import { hc } from "hono/client";
import { useEffect, useState } from "react";
import { useWatch } from "react-hook-form";
import { useRemixForm } from "remix-hook-form";
import type { AppType } from "server";
import type { ClaimValues, RoundType } from "server/api/claim/excel";
import { Input } from "~/components/input";
import { Select } from "~/components/select";
import { calcPeriod } from "~/utils/calcPeriod";
import { calcPrice, type CalcType } from "~/utils/calcPrice";
import { datePipe } from "~/utils/datePipe";
import { dlBlob } from "~/utils/dlBlob";
import { calcComma } from "~/utils/price";
import { isHasUndefined } from "~/utils/typeGuard";

const client = hc<AppType>(import.meta.env.VITE_API_URL);

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const param = url.searchParams;
  const res = await client.api.contract.$get({
    query: { id: param.get("id") ?? "", type: "customer" },
  });
  return res;
};

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

export default function Index() {
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

  const [total, setTotal] = useState("0");

  const {
    WorkPrice = 0,
    WorkTime = 0,
    OtherPrice = 0,
    UnderTime = 0,
    OverTime = 0,
    PaidFrom = 0,
    PaidTo = 0,
    OverPrice = 0,
    UnderPrice = 0,
    RoundType: RoundTypeValue = "round",
    RoundDigit = 1,
    CalcType = "highLow",
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

    setTotal(
      calcComma(
        WorkPrice * WorkTime +
          (contractData.isHour ? 0 : overPrice * OverTime) -
          (contractData.isHour ? 0 : underPrice * UnderTime) +
          OtherPrice,
      ),
    );
  }, [
    RoundTypeValue,
    WorkPrice,
    WorkTime,
    OtherPrice,
    UnderTime,
    OverTime,
    PaidFrom,
    PaidTo,
    RoundDigit,
    contractData,
    CalcType,
    setValue,
  ]);

  const handleSubmit = async () => {
    try {
      const value = getValues();
      // APIリクエストなどの処理をここに記述
      if (value) {
        const formData = {
          ...value,
          OverPrice,
          UnderPrice,
          Sales: contractData.sales,
          Company: contractData.company,
          Worker: contractData.worker,
        } as ClaimValues;

        if (isHasUndefined(formData)) {
          await client.api.contract.$put({
            json: {
              id: contractData.id,
              values: {
                subject: value.Subject,
              },
            },
          });
          await client.api.payment.$put({
            json: {
              id: contractData.paymentId,
              values: {
                workPrice: value.WorkPrice,
                paidFrom: value.PaidFrom,
                paidTo: value.PaidTo,
                roundType: value.RoundType,
                roundDigit: value.RoundDigit,
                periodDate: value.Period,
              },
            },
          });

          const response = await client.api.claim.excel.$post({
            json: {
              ...formData,
              url: import.meta.env.VITE_API_URL,
              isHour: contractData.isHour,
              isFixed: contractData.isFixed,
            },
          });
          await dlBlob({
            response,
            worker: contractData.worker ?? "",
            type: "claim",
          });
        } else {
          alert("フォームを埋めてください");
        }
      } else {
        alert("フォームを埋めてください");
      }
    } catch (error) {
      console.error("Form submission error:", error);
      alert("予期せぬエラーです");
    }
  };

  return (
    <div className="container mx-auto px-4">
      <h1 className="mb-5 text-left font-bold text-3xl">請求書作成装置</h1>
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
          <span className="mt-2 mb-2 font-bold text-sm">顧客担当</span>
          <h2 className="mb-2 ml-2 font-bold text-xl underline underline-offset-4">
            {contractData.sales}
          </h2>
          <span className="mt-2 mb-2 font-bold text-sm">顧客</span>
          <h2 className="mb-2 ml-2 font-bold text-xl underline underline-offset-4">
            {contractData.company}
          </h2>
          <span className="mt-2 mb-2 font-bold text-sm">作業者名</span>
          <h2 className="mb-2 ml-2 font-bold text-xl underline underline-offset-4">
            {contractData.worker}
          </h2>

          {/* <div className="mt-5 flex items-center justify-end">
            <Input
              type="checkbox"
              id="another"
              name="another"
              className="m-0 h-6 w-6 p-0"
            />
            <span className="ml-2">別紙を作成する</span>
          </div> */}
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
          <div className="mt-10">
            <div className="total font-bold text-lg">合計額:</div>
            <div className="price text-right font-extrabold font-num text-2xl">
              {total}
            </div>
          </div>
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
          <Input register={register("Period")} type="date" />
          <span className="mt-2 mb-2 font-bold text-sm">請求期間</span>
          <div className="range mb-2 flex items-center gap-2">
            <Input register={register("ClaimFrom")} type="date" />
            ~
            <Input register={register("ClaimTo")} type="date" />
          </div>
          <span className="mt-2 mb-2 font-bold text-sm">清算幅(h)</span>
          <div className="range mb-5 flex items-center gap-2">
            <Input
              register={register("PaidFrom", { valueAsNumber: true })}
              type="number"
              inputMode="numeric"
              placeholder="140"
              disable={contractData.isHour || contractData.isFixed}
            />
            ~
            <Input
              register={register("PaidTo", { valueAsNumber: true })}
              type="number"
              inputMode="numeric"
              placeholder="180"
              disable={contractData.isHour || contractData.isFixed}
            />
          </div>
          <div className="mb-5 grid grid-cols-3 gap-5">
            <div className="flex flex-col">
              <span className="mb-2 font-bold text-sm">入単価</span>
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
          <div className="mb-5 grid grid-cols-3 gap-5">
            <div className="flex flex-col">
              <span className="mb-2 font-bold text-sm">
                {contractData.isHour ? "作業人時" : "作業人月"}
              </span>
              <Input
                register={register("WorkTime", { valueAsNumber: true })}
                type="number"
                inputMode="numeric"
                placeholder="1.0"
              />
            </div>
            <div className="flex flex-col">
              <span className="mb-2 font-bold text-sm">超過工数(h)</span>
              <Input
                register={register("OverTime", { valueAsNumber: true })}
                type="number"
                inputMode="numeric"
                placeholder="0.0"
                disable={contractData.isFixed}
              />
            </div>
            <div className="flex flex-col">
              <span className="mb-2 font-bold text-sm">控除工数(h)</span>
              <Input
                register={register("UnderTime", { valueAsNumber: true })}
                type="number"
                inputMode="numeric"
                placeholder="0.0"
                disable={contractData.isFixed}
              />
            </div>
          </div>
          <span className="mt-2 mb-2 font-bold text-sm">その他費用</span>
          <Input
            register={register("OtherPrice", { valueAsNumber: true })}
            type="number"
            inputMode="numeric"
            placeholder="0"
          />
          <button
            type="button"
            className="mt-5 h-14 rounded-md bg-teal-500 px-4 py-2 font-bold text-white shadow-md hover:bg-teal-600"
            onClick={handleSubmit}
          >
            Excelを出力する
          </button>
        </div>
      </div>
    </div>
  );
}
