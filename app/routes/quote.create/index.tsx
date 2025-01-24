import { DateRangePicker } from "~/components/date-picker/date-range-picker";
import { Input } from "~/components/input/input";
import { Select } from "~/components/input/select";
import { useHooks } from "./useHooks";
import { CALC_OPTION, ROUND_OPTION } from "~/constants/selectData";
import { contractLoader } from "./loader";
import { Button } from "~/components/input/button";
import { InputWrapper } from "~/components/input/inputWrapper";
import { LeftData } from "~/layouts/leftData";
import { Container } from "~/components/container";

export const loader = contractLoader;

export default function Index() {
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

  const RightSide = () => (
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
        契約期間
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
                disabled: contractData.isFixed,
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
              props={{ disabled: contractData.isFixed }}
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
                disabled: contractData.isFixed,
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
              props={{ disabled: contractData.isFixed }}
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
      <Button props={{ type: "button", onClick: onSubmit }}>
        Excelを出力する
      </Button>
    </div>
  );

  return (
    <Container title="見積書作成装置">
      <div className="flex gap-2">
        <LeftData
          isFixed={contractData.isFixed}
          isHour={contractData.isHour}
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
        <RightSide />
      </div>
    </Container>
  );
}
