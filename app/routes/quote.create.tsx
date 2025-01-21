import type { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";
import { hc } from "hono/client";
import { useEffect, useState } from "react";
import { useWatch } from "react-hook-form";
import { useRemixForm } from "remix-hook-form";
import type { AppType } from "server";
import type { QuoteValues, RoundType } from "server/api/quote/excel";
import { DateRangePicker } from "~/components/date-picker/date-range-picker";
import { Input } from "~/components/input";
import { Select } from "~/components/select";
import { calcPeriod } from "~/utils/calcPeriod";
import { type CalcType, calcPrice } from "~/utils/calcPrice";
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

export default function Index() {
  const { contractData } = useLoaderData<typeof loader>();

  const { getValues, register, control, setValue } = useRemixForm<QuoteValues>({
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

  const handleSubmit = async () => {
    try {
      const value = getValues();
      // APIリクエストなどの処理をここに記述
      if (value) {
        const formData = {
          ...value,
          OverPrice,
          UnderPrice,
          Sales: contractData?.sales ?? "",
          Company: contractData?.company ?? "",
          Worker: contractData?.worker ?? "",
        } as QuoteValues;

        if (isHasUndefined(formData)) {
          await client.api.contract.$put({
            json: {
              id: contractData.id,
              values: {
                from: value.ContractFrom,
                to: value.ContractTo,
                subject: value.Subject,
                document: value.Document,
                contractType: value.ContractType,
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

          const from = new Date(value.ContractFrom);
          const to = new Date(value.ContractTo);

          const response = await client.api.quote.excel.$post({
            json: {
              ...formData,
              url: import.meta.env.VITE_API_URL,
              isHour: contractData.isHour,
              isFixed: contractData.isFixed,
              ContractRange:
                Number(`${to.getFullYear()}${to.getMonth()}`) -
                Number(`${from.getFullYear()}${from.getMonth()}`),
            },
          });
          await dlBlob({
            response,
            worker: contractData?.worker ?? "",
            type: "quote",
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
      <h1 className="mb-5 text-left font-bold text-3xl">見積書作成装置</h1>
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
            {contractData?.sales}
          </h2>
          <span className="mt-2 mb-2 font-bold text-sm">顧客</span>
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
              <span className="mb-2 font-bold text-sm">単価(万)</span>
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
            onClick={handleSubmit}
          >
            Excelを出力する
          </button>
        </div>
      </div>
    </div>
  );
}
