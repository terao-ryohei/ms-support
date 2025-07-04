import { DateRangePicker } from "~/components/date-picker/date-range-picker";
import { Input } from "~/components/input/input";
import { Select } from "~/components/input/select";
import { useHooks } from "./useHooks";
import { CALC_OPTION, ROUND_OPTION } from "~/constants/selectData";
import { contractLoader } from "./loader";
import { InputWrapper } from "~/components/input/inputWrapper";
import { LeftData } from "~/layouts/leftData";
import { Container } from "~/components/container";
import type { PayType } from "~/types/payType";
import { useNavigate, type MetaFunction } from "react-router";
import { useCallback, useMemo } from "react";

export const meta: MetaFunction = () => [{ title: "見積書作成装置" }];

export const loader = contractLoader;

export default function Index() {
  const navigate = useNavigate();

  const {
    contractData,
    OverPrice,
    UnderPrice,
    date,
    WorkPrice,
    PaidFrom,
    PaidTo,
    CalcTypeValue,
    register,
    onDateUpdate,
    onSubmit,
  } = useHooks();

  const onBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  const RightSide = useMemo(
    () => (
      <div className="form-wrap flex flex-1 flex-col rounded-lg bg-muted p-5 text-muted-foreground">
        <InputWrapper
          input={
            <Input
              register={register("Initial")}
              props={{ inputMode: "url", placeholder: "A" }}
            />
          }
        >
          請求書作成者イニシャル
        </InputWrapper>
        <InputWrapper
          input={
            <Input
              register={register("Subject")}
              props={{ placeholder: "開発業務" }}
            />
          }
        >
          件名
        </InputWrapper>
        <InputWrapper
          input={
            <Input
              register={register("Period")}
              props={{ placeholder: "月末締め翌々月15日御支払" }}
            />
          }
        >
          支払期日
        </InputWrapper>
        <InputWrapper
          input={
            <div className="mb-2 w-full">
              <DateRangePicker
                initialDateFrom={date[0]}
                initialDateTo={date[1]}
                onUpdate={onDateUpdate}
              />
            </div>
          }
        >
          請求期間
        </InputWrapper>
        <InputWrapper
          input={
            <div className="range mb-5 flex items-center gap-2">
              <Input
                register={register("PaidFrom", { valueAsNumber: true })}
                props={{
                  type: "number",
                  placeholder: "140",
                  inputMode: "numeric",
                  disabled: contractData.payType === "fixed",
                }}
              />
              ~
              <Input
                register={register("PaidTo", { valueAsNumber: true })}
                props={{
                  type: "number",
                  placeholder: "180",
                  inputMode: "numeric",
                }}
              />
            </div>
          }
        >
          基準時間(h)
        </InputWrapper>
        <div className="mb-5 grid grid-cols-3 gap-5">
          <InputWrapper
            input={
              <Input
                register={register("WorkPrice", { valueAsNumber: true })}
                props={{
                  type: "number",
                  placeholder: "60",
                  inputMode: "numeric",
                }}
              />
            }
          >
            単価(万)
          </InputWrapper>
          <InputWrapper
            input={
              <Select
                register={register("RoundType")}
                data={ROUND_OPTION}
                props={{ disabled: contractData.payType === "fixed" }}
              />
            }
          >
            端数処理
          </InputWrapper>
          <InputWrapper
            input={
              <Input
                register={register("RoundDigit", { valueAsNumber: true })}
                props={{
                  type: "number",
                  placeholder: "1",
                  inputMode: "numeric",
                  disabled: contractData.payType === "fixed",
                }}
              />
            }
          >
            端数処理桁数
          </InputWrapper>
        </div>
        <div className="mb-5 grid grid-cols-3 gap-5">
          <InputWrapper
            input={
              <Select
                register={register("CalcType")}
                data={CALC_OPTION}
                props={{ disabled: contractData.payType === "fixed" }}
              />
            }
          >
            超過控除の計算
          </InputWrapper>
          <InputWrapper
            input={
              <Input
                register={register("OverPrice")}
                props={{
                  type: "number",
                  inputMode: "numeric",
                }}
              />
            }
          >
            超過単価
          </InputWrapper>
          <InputWrapper
            input={
              <Input
                register={register("UnderPrice")}
                props={{
                  type: "number",
                  inputMode: "numeric",
                }}
              />
            }
          >
            控除単価
          </InputWrapper>
        </div>
        <div className="mb-5 grid grid-cols-2 gap-5">
          <InputWrapper
            input={
              <Input
                register={register("Document")}
                props={{
                  placeholder: "作業報告書",
                }}
              />
            }
          >
            成果物
          </InputWrapper>
          <InputWrapper
            input={
              <Input
                register={register("ContractType")}
                props={{
                  placeholder: "業務委託",
                }}
              />
            }
          >
            契約形態
          </InputWrapper>
        </div>
        <button
          type="button"
          className="mt-5 h-20 rounded-md bg-secondary px-4 py-2 font-bold text-white shadow-md hover:bg-secondary-hover"
          onClick={onSubmit}
        >
          Excelを出力する
        </button>
        <button
          type="button"
          className="mt-5 h-20 rounded-md bg-white px-4 py-2 font-bold text-black shadow-md hover:bg-gray-200"
          onClick={onBack}
        >
          戻る
        </button>
      </div>
    ),
    [contractData, onBack, onSubmit, register, date, onDateUpdate],
  );

  return (
    <Container title="見積書作成装置">
      <div className="flex gap-2">
        <LeftData
          payType={contractData.payType as PayType}
          sales={contractData.sales ?? ""}
          company={contractData.company ?? ""}
          worker={contractData.worker ?? ""}
          overPrice={OverPrice}
          underPrice={UnderPrice}
          workPrice={WorkPrice}
          paidFrom={PaidFrom}
          paidTo={PaidTo}
          calcType={CalcTypeValue}
        />
        {RightSide}
      </div>
    </Container>
  );
}
