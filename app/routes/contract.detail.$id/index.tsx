import { hc } from "hono/client";
import type { AppType } from "server";
import { redirect, type LoaderFunctionArgs } from "@remix-run/cloudflare";
import { DateRangePicker } from "~/components/date-picker/date-range-picker";
import { EditableList } from "~/components/table/editableList";
import { Button } from "~/components/input/button";
import { useHooks } from "./useHooks";
import { onSubmit } from "./submit";
import { useNavigate } from "@remix-run/react";

const client = hc<AppType>(import.meta.env.VITE_API_URL);

export const loader = async ({ params }: LoaderFunctionArgs) => {
  if (!params.id) {
    redirect("/contract/detail/new");
  }

  const id = params.id ?? "";
  const contractData = await (
    await client.api.contract.detail.$get({ query: { id } })
  ).json();
  const salesData = await (await client.api.sales.$get()).json();
  const companiesData = await (await client.api.companies.$get()).json();
  const workersData = await (await client.api.workers.$get()).json();
  return { contractData, salesData, companiesData, workersData };
};

export const translatedArray = {
  id: "契約ID",
  worker: "作業者名",
  claimSales: "営業担当",
  orderSales: "要員担当",
  claimCompany: "顧客",
  orderCompany: "所属",
  subject: "案件名",
  profit: "粗利",
  profitRatio: "粗利率",
  payment: {
    price: "単価",
    payType: "清算方式",
    paidFrom: "清算幅From",
    paidTo: "清算幅To",
    roundType: "丸めタイプ",
    roundDigit: "丸め桁",
    periodDate: "支払期日",
    overPrice: "超過単価",
    underPrice: "控除単価",
    calcType: "超過控除計算方式",
  },
  claimContractRange: "請求期間",
  orderContractRange: "注文期間",
};

export default function Index() {
  const navigate = useNavigate();

  const {
    contractData,
    sales,
    company,
    worker,
    contractRange,
    getValues,
    workersList,
    salesList,
    companyList,
    register,
    onChangeSales,
    onChangeCompanies,
    onChangeWorkers,
    onAddSales,
    onAddCompanies,
    onAddWorkers,
    onChangeDate,
  } = useHooks();

  const onClick = async () => {
    await onSubmit({
      sales,
      company,
      worker,
      contractRange,
      values: getValues(),
      id: contractData.id,
      paymentId: {
        claim: contractData.claimPayment.paymentId,
        order: contractData.orderPayment.paymentId,
      },
    });
    navigate("/contract/data");
  };

  return (
    <div>
      <div className="mb-4 flex">
        <div className="flex border border-gray-300 border-solid">
          <div className="flex h-14 w-40 items-center justify-center bg-[#e0ffe0]">
            {translatedArray.id}
          </div>
          <div className="flex w-full items-center justify-center">
            {contractData.id}
          </div>
        </div>
        <div className="flex grow border border-gray-300 border-l-0 border-solid">
          <div className="flex h-14 w-40 items-center justify-center bg-[#e0ffe0]">
            {translatedArray.worker}
          </div>
          <EditableList
            className="h-full w-full"
            data={workersList}
            value={contractData.workerId}
            onChange={onChangeWorkers}
            onAdd={onAddWorkers}
          />
        </div>
      </div>
      <div className="flex">
        <div className="flex w-full grow border border-gray-300 border-b-0 border-solid">
          <div className="flex h-14 w-40 items-center justify-center bg-[#e0ffe0]">
            {translatedArray.orderSales}
          </div>
          <EditableList
            className="h-full w-full"
            data={salesList}
            value={contractData.orderSalesId}
            onChange={onChangeSales}
            onAdd={onAddSales}
          />
        </div>
        <div className="flex w-full grow border border-gray-300 border-b-0 border-l-0 border-solid">
          <div className="flex h-14 w-40 items-center justify-center bg-[#e0ffe0]">
            {translatedArray.claimSales}
          </div>
          <EditableList
            className="h-full w-full"
            data={salesList}
            value={contractData.claimSalesId}
            onChange={onChangeSales}
            onAdd={onAddSales}
          />
        </div>
      </div>
      <div className="mb-4 flex">
        <div className="flex w-full grow border border-gray-300 border-solid">
          <div className="flex h-14 w-40 items-center justify-center bg-[#e0ffe0]">
            {translatedArray.orderCompany}
          </div>
          <EditableList
            className="h-full w-full"
            data={companyList}
            value={contractData.orderCompanyId}
            onChange={onChangeCompanies}
            onAdd={onAddCompanies}
          />
        </div>
        <div className="flex w-full grow border border-gray-300 border-l-0 border-solid">
          <div className="flex h-14 w-40 items-center justify-center bg-[#e0ffe0]">
            {translatedArray.claimCompany}
          </div>
          <EditableList
            className="h-full w-full"
            data={companyList}
            value={contractData.claimCompanyId}
            onChange={onChangeCompanies}
            onAdd={onAddCompanies}
          />
        </div>
      </div>
      <div className="mb-8 flex">
        <div className="flex w-full grow border border-gray-300 border-solid">
          <div className="flex h-14 w-40 items-center justify-center bg-[#e0ffe0]">
            {translatedArray.subject}
          </div>
          <input
            className="w-full rounded-md p-2 text-sm"
            {...register("Subject", { required: true })}
          />
        </div>
      </div>
      <div className="mb-2 ml-2 font-bold">請求情報</div>
      <div className="mx-2 flex">
        <div className="flex w-full grow items-center border border-gray-300 border-b-0 border-solid">
          <div className="flex h-14 w-40 items-center justify-center bg-[#fde8ff]">
            {translatedArray.claimContractRange}
          </div>
          <DateRangePicker
            className="h-[90%]"
            initialDateFrom={
              new Date(contractData.claimPayment.contractRange.split("~")[0])
            }
            initialDateTo={
              new Date(contractData.claimPayment.contractRange.split("~")[1])
            }
            onUpdate={onChangeDate}
          />
        </div>
      </div>
      <div className="mx-2 flex">
        <div className="flex w-full grow border border-gray-300 border-b-0 border-solid">
          <div className="flex h-14 w-40 items-center justify-center bg-[#fde8ff]">
            {translatedArray.payment.payType}
          </div>
          <select
            className="w-full rounded-md p-2 text-sm"
            {...register("ClaimPayType", { required: true })}
          >
            <option value="month">通常</option>
            <option value="date">日当</option>
            <option value="hour">時給</option>
            <option value="fixed">固定</option>
          </select>
        </div>
        <div className="flex w-full grow border border-gray-300 border-b-0 border-l-0 border-solid">
          <div className="flex h-14 w-40 items-center justify-center bg-[#fde8ff]">
            {translatedArray.payment.price}
          </div>
          <input
            className="w-full rounded-md p-2 text-right text-sm"
            {...register("ClaimWorkPrice", { required: true })}
          />
        </div>
        <div className="flex w-full grow border border-gray-300 border-b-0 border-l-0 border-solid">
          <div className="flex h-14 w-40 items-center justify-center bg-[#fde8ff]">
            {translatedArray.payment.periodDate}
          </div>
          <input
            className="w-full rounded-md p-2 text-sm"
            {...register("ClaimPeriod", { required: true })}
          />
        </div>
      </div>
      <div className="mx-2 flex">
        <div className="flex w-full grow border border-gray-300 border-b-0 border-solid">
          <div className="flex h-14 w-40 items-center justify-center bg-[#fde8ff]">
            {translatedArray.payment.paidFrom}
          </div>
          <input
            className="w-full rounded-md p-2 text-right text-sm"
            {...register("ClaimPaidFrom", {
              valueAsNumber: true,
              required: true,
            })}
          />
        </div>
        <div className="flex w-full grow border border-gray-300 border-b-0 border-l-0 border-solid">
          <div className="flex h-14 w-40 items-center justify-center bg-[#fde8ff]">
            {translatedArray.payment.paidTo}
          </div>
          <input
            className="w-full rounded-md p-2 text-right text-sm"
            {...register("ClaimPaidTo", {
              valueAsNumber: true,
              required: true,
            })}
          />
        </div>
      </div>
      <div className="mx-2 flex">
        <div className="flex w-full grow border border-gray-300 border-b-0 border-solid">
          <div className="flex h-14 w-40 items-center justify-center bg-[#fde8ff]">
            {translatedArray.payment.roundType}
          </div>
          <select
            className="w-full rounded-md p-2 text-sm"
            {...register("ClaimRoundType", { required: true })}
          >
            <option value="round">四捨五入</option>
            <option value="ceil">切り上げ</option>
            <option value="floor">切り捨て</option>
          </select>
        </div>
        <div className="flex w-full grow border border-gray-300 border-b-0 border-l-0 border-solid">
          <div className="flex h-14 w-40 items-center justify-center bg-[#fde8ff]">
            {translatedArray.payment.roundDigit}
          </div>
          <input
            className="w-full rounded-md p-2 text-right text-sm"
            {...register("ClaimRoundDigit", {
              valueAsNumber: true,
              required: true,
            })}
          />
        </div>
      </div>
      <div className="mx-2 mb-8 flex">
        <div className="flex w-full grow border border-gray-300 border-solid">
          <div className="flex h-14 w-40 items-center justify-center bg-[#fde8ff]">
            {translatedArray.payment.overPrice}
          </div>
          <input
            className="w-full rounded-md p-2 text-right text-sm"
            {...register("ClaimOverPrice", { required: true })}
          />
        </div>
        <div className="flex w-full grow border border-gray-300 border-l-0 border-solid">
          <div className="flex h-14 w-40 items-center justify-center bg-[#fde8ff]">
            {translatedArray.payment.underPrice}
          </div>
          <input
            className="w-full rounded-md p-2 text-right text-sm"
            {...register("ClaimUnderPrice", { required: true })}
          />
        </div>
        <div className="flex w-full grow border border-gray-300 border-l-0 border-solid">
          <div className="flex h-14 w-40 items-center justify-center bg-[#fde8ff]">
            {translatedArray.payment.calcType}
          </div>
          <select
            className="w-full rounded-md p-2 text-sm"
            {...register("ClaimCalcType", { required: true })}
          >
            <option value="center">中間割</option>
            <option value="highLow">上下割</option>
            <option value="other">その他</option>
          </select>
        </div>
      </div>
      <div className="mb-2 ml-2 font-bold">注文情報</div>
      <div className="mx-2 flex">
        <div className="flex w-full grow items-center border border-gray-300 border-b-0 border-solid">
          <div className="flex h-14 w-40 items-center justify-center bg-[#fff0ce]">
            {translatedArray.claimContractRange}
          </div>
          <DateRangePicker
            className="h-[90%]"
            initialDateFrom={
              new Date(contractData.orderPayment.contractRange.split("~")[0])
            }
            initialDateTo={
              new Date(contractData.orderPayment.contractRange.split("~")[1])
            }
            onUpdate={onChangeDate}
          />
        </div>
      </div>
      <div className="mx-2 flex">
        <div className="flex w-full grow border border-gray-300 border-b-0 border-solid">
          <div className="flex h-14 w-40 items-center justify-center bg-[#fff0ce]">
            {translatedArray.payment.payType}
          </div>
          <select
            className="w-full rounded-md p-2 text-sm"
            {...register("OrderPayType", { required: true })}
          >
            <option value="month">通常</option>
            <option value="date">日当</option>
            <option value="hour">時給</option>
            <option value="fixed">固定</option>
          </select>
        </div>
        <div className="flex w-full grow border border-gray-300 border-b-0 border-l-0 border-solid">
          <div className="flex h-14 w-40 items-center justify-center bg-[#fff0ce]">
            {translatedArray.payment.price}
          </div>
          <input
            className="w-full rounded-md p-2 text-right text-sm"
            {...register("OrderWorkPrice", { required: true })}
          />
        </div>
        <div className="flex w-full grow border border-gray-300 border-b-0 border-l-0 border-solid">
          <div className="flex h-14 w-40 items-center justify-center bg-[#fff0ce]">
            {translatedArray.payment.periodDate}
          </div>
          <input
            className="w-full rounded-md p-2 text-sm"
            {...register("OrderPeriod", { required: true })}
          />
        </div>
      </div>
      <div className="mx-2 flex">
        <div className="flex w-full grow border border-gray-300 border-b-0 border-solid">
          <div className="flex h-14 w-40 items-center justify-center bg-[#fff0ce]">
            {translatedArray.payment.paidFrom}
          </div>
          <input
            className="w-full rounded-md p-2 text-right text-sm"
            {...register("OrderPaidFrom", {
              valueAsNumber: true,
              required: true,
            })}
          />
        </div>
        <div className="flex w-full grow border border-gray-300 border-b-0 border-l-0 border-solid">
          <div className="flex h-14 w-40 items-center justify-center bg-[#fff0ce]">
            {translatedArray.payment.paidTo}
          </div>
          <input
            className="w-full rounded-md p-2 text-right text-sm"
            {...register("OrderPaidTo", {
              valueAsNumber: true,
              required: true,
            })}
          />
        </div>
      </div>
      <div className="mx-2 flex">
        <div className="flex w-full grow border border-gray-300 border-b-0 border-solid">
          <div className="flex h-14 w-40 items-center justify-center bg-[#fff0ce]">
            {translatedArray.payment.roundType}
          </div>
          <select
            className="w-full rounded-md p-2 text-sm"
            {...register("OrderRoundType", { required: true })}
          >
            <option value="round">四捨五入</option>
            <option value="ceil">切り上げ</option>
            <option value="floor">切り捨て</option>
          </select>
        </div>
        <div className="flex w-full grow border border-gray-300 border-b-0 border-l-0 border-solid">
          <div className="flex h-14 w-40 items-center justify-center bg-[#fff0ce]">
            {translatedArray.payment.roundDigit}
          </div>
          <input
            className="w-full rounded-md p-2 text-right text-sm"
            {...register("OrderRoundDigit", {
              valueAsNumber: true,
              required: true,
            })}
          />
        </div>
      </div>
      <div className="mx-2 flex">
        <div className="flex w-full grow border border-gray-300 border-solid">
          <div className="flex h-14 w-40 items-center justify-center bg-[#fff0ce]">
            {translatedArray.payment.overPrice}
          </div>
          <input
            className="w-full rounded-md p-2 text-right text-sm"
            {...register("OrderOverPrice", { required: true })}
          />
        </div>
        <div className="flex w-full grow border border-gray-300 border-l-0 border-solid">
          <div className="flex h-14 w-40 items-center justify-center bg-[#fff0ce]">
            {translatedArray.payment.underPrice}
          </div>
          <input
            className="w-full rounded-md p-2 text-right text-sm"
            {...register("OrderUnderPrice", { required: true })}
          />
        </div>
        <div className="flex w-full grow border border-gray-300 border-l-0 border-solid">
          <div className="flex h-14 w-40 items-center justify-center bg-[#fff0ce]">
            {translatedArray.payment.calcType}
          </div>
          <select
            className="w-full rounded-md p-2 text-sm"
            {...register("OrderCalcType", { required: true })}
          >
            <option value="center">中間割</option>
            <option value="highLow">上下割</option>
            <option value="other">その他</option>
          </select>
        </div>
      </div>
      <div className="mt-5 flex justify-center">
        <Button className="h-20 w-50" props={{ onClick: onClick }}>
          保存
        </Button>
      </div>
    </div>
  );
}
