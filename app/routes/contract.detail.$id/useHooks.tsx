import { useLoaderData } from "@remix-run/react";
import { useState, useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { calcPrice } from "~/utils/calcPrice";
import type { loader } from ".";
import type { AppType } from "server";
import { hc } from "hono/client";
import { datePipe } from "~/utils/datePipe";

const client = hc<AppType>(import.meta.env.VITE_API_URL);

export const useHooks = () => {
  const { contractData, salesData, companiesData, workersData } =
    useLoaderData<typeof loader>();

  const { register, control, setValue, getValues } = useForm({
    defaultValues: {
      ClaimPeriod: contractData.claimPayment.periodDate,
      ClaimPaidFrom: contractData.claimPayment.paidFrom,
      ClaimPaidTo: contractData.claimPayment.paidTo,
      ClaimWorkPrice: contractData.claimPayment.workPrice,
      ClaimCalcType: contractData.claimPayment.calcType,
      ClaimRoundType: contractData.claimPayment.roundType,
      ClaimPayType: contractData.claimPayment.payType,
      ClaimRoundDigit: contractData.claimPayment.roundDigit,
      ClaimOverPrice: contractData.claimPayment.overPrice,
      ClaimUnderPrice: contractData.claimPayment.underPrice,
      OrderPeriod: contractData.orderPayment.periodDate,
      OrderPaidFrom: contractData.orderPayment.paidFrom,
      OrderPaidTo: contractData.orderPayment.paidTo,
      OrderWorkPrice: contractData.orderPayment.workPrice,
      OrderCalcType: contractData.orderPayment.calcType,
      OrderRoundType: contractData.orderPayment.roundType,
      OrderPayType: contractData.orderPayment.payType,
      OrderRoundDigit: contractData.orderPayment.roundDigit,
      OrderOverPrice: contractData.orderPayment.overPrice,
      OrderUnderPrice: contractData.orderPayment.underPrice,
      Subject: contractData.subject,
      Document: contractData.document,
      ContractType: contractData.contractType,
    },
  });

  const [salesList, setSalesList] = useState(salesData);
  const [companyList, setCompanyList] = useState(companiesData);
  const [workersList, setWorkersList] = useState(workersData);
  const [sales, setSales] = useState({
    claim: 1,
    order: 1,
  });
  const [company, setCompany] = useState({
    claim: 1,
    order: 1,
  });
  const [worker, setWorker] = useState(1);
  const [contractRange, setContractRange] = useState(
    contractData.orderPayment.contractRange,
  );

  const {
    ClaimWorkPrice = 0,
    ClaimPaidFrom = 0,
    ClaimPaidTo = 0,
    ClaimRoundType = "round",
    ClaimRoundDigit = 1,
    ClaimCalcType = "highLow",
    OrderWorkPrice = 0,
    OrderPaidFrom = 0,
    OrderPaidTo = 0,
    OrderRoundType = "round",
    OrderRoundDigit = 1,
    OrderCalcType = "highLow",
  } = useWatch({ control });

  useEffect(() => {
    const { overPrice: claimOverprice, underPrice: claimUnderPrice } =
      calcPrice({
        workPrice: ClaimWorkPrice,
        from: ClaimPaidFrom,
        to: ClaimPaidTo,
        roundType: ClaimRoundType,
        roundDigit: ClaimRoundDigit,
        calcType: ClaimCalcType,
      });

    const { overPrice: orderOverprice, underPrice: orderUnderPrice } =
      calcPrice({
        workPrice: OrderWorkPrice,
        from: OrderPaidFrom,
        to: OrderPaidTo,
        roundType: OrderRoundType,
        roundDigit: OrderRoundDigit,
        calcType: OrderCalcType,
      });

    setValue("ClaimOverPrice", claimOverprice);
    setValue("ClaimUnderPrice", claimUnderPrice);
    setValue("OrderOverPrice", orderOverprice);
    setValue("OrderUnderPrice", orderUnderPrice);
  }, [
    ClaimRoundType,
    ClaimWorkPrice,
    ClaimPaidFrom,
    ClaimPaidTo,
    ClaimRoundDigit,
    ClaimCalcType,
    OrderRoundType,
    OrderWorkPrice,
    OrderPaidFrom,
    OrderPaidTo,
    OrderRoundDigit,
    OrderCalcType,
    setValue,
  ]);

  const onChangeClaimSales = (value: string) => {
    setSales((data) => ({ ...data, claim: Number(value) }));
  };
  const onChangeOrderSales = (value: string) => {
    setSales((data) => ({ ...data, order: Number(value) }));
  };

  const onAddSales = async (value: string) => {
    const res = await (
      await client.api.sales.$post({
        json: {
          name: value,
        },
      })
    ).json();
    setSalesList((list) => [...list, ...res]);
  };

  const onChangeClaimCompanies = (value: string) => {
    setCompany((data) => ({ ...data, claim: Number(value) }));
  };
  const onChangeOrderCompanies = (value: string) => {
    setCompany((data) => ({ ...data, order: Number(value) }));
  };

  const onAddCompanies = async (value: string) => {
    const res = await (
      await client.api.companies.$post({
        json: {
          name: value,
        },
      })
    ).json();
    setCompanyList((list) => [...list, ...res]);
  };

  const onChangeWorkers = (value: string) => {
    setWorker(Number(value));
  };

  const onAddWorkers = async (value: string) => {
    const res = await (
      await client.api.workers.$post({
        json: {
          name: value,
        },
      })
    ).json();
    setWorkersList((list) => [...list, ...res]);
  };

  const onChangeDate = ({
    range: { from, to },
  }: { range: { from: Date; to?: Date } }) => {
    setContractRange(`${datePipe(from)}~${to && datePipe(to)}`);
  };

  return {
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
    onChangeClaimCompanies,
    onChangeOrderCompanies,
    onChangeClaimSales,
    onChangeOrderSales,
    onChangeWorkers,
    onAddSales,
    onAddCompanies,
    onAddWorkers,
    onChangeDate,
  };
};
