import { useLoaderData } from "react-router";
import { useState, useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { defaultData } from "~/constants/default";
import { calcPrice } from "~/utils/calcPrice";
import type { loader } from ".";
import type { AppType } from "server";
import { hc } from "hono/client";
import { datePipe } from "~/utils/datePipe";

const client = hc<AppType>(import.meta.env.VITE_API_URL);

export const useHooks = () => {
  const { salesData, companiesData, workersData } =
    useLoaderData<typeof loader>();

  const { register, control, setValue, getValues } = useForm({
    defaultValues: {
      ClaimPeriod: defaultData.periodDate,
      ClaimPaidFrom: defaultData.paidFrom,
      ClaimPaidTo: defaultData.paidTo,
      ClaimWorkPrice: defaultData.workPrice,
      ClaimCalcType: defaultData.calcType,
      ClaimRoundType: defaultData.roundType,
      ClaimPayType: defaultData.payType,
      ClaimRoundDigit: defaultData.roundDigit,
      ClaimOverPrice: defaultData.overPrice,
      ClaimUnderPrice: defaultData.underPrice,
      OrderPeriod: defaultData.periodDate,
      OrderPaidFrom: defaultData.paidFrom,
      OrderPaidTo: defaultData.paidTo,
      OrderWorkPrice: defaultData.workPrice,
      OrderCalcType: defaultData.calcType,
      OrderRoundType: defaultData.roundType,
      OrderPayType: defaultData.payType,
      OrderRoundDigit: defaultData.roundDigit,
      OrderOverPrice: defaultData.overPrice,
      OrderUnderPrice: defaultData.underPrice,
      Subject: defaultData.subject,
      Document: defaultData.document,
      ContractType: defaultData.contractType,
    },
  });

  const [salesList, setSalesList] = useState(salesData);
  const [companyList, setCompanyList] = useState(companiesData);
  const [workersList, setWorkersList] = useState(workersData);
  const [sales, setSales] = useState({
    claim: 0,
    order: 0,
  });
  const [company, setCompany] = useState({
    claim: 0,
    order: 0,
  });
  const [worker, setWorker] = useState(0);
  const [claimContractRange, setClaimContractRange] = useState(
    defaultData.contractRange,
  );
  const [orderContractRange, setOrderContractRange] = useState(
    defaultData.contractRange,
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
    type,
  }: { range: { from: Date; to?: Date }; type: "claim" | "order" }) => {
    if (type === "claim") {
      setClaimContractRange(`${datePipe(from)}~${to && datePipe(to)}`);
    } else {
      setOrderContractRange(`${datePipe(from)}~${to && datePipe(to)}`);
    }
  };

  return {
    sales,
    company,
    worker,
    claimContractRange,
    orderContractRange,
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
