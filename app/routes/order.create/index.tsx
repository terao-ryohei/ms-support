import { DateRangePicker } from "~/components/date-picker/date-range-picker";
import { Input } from "~/components/input/input";
import { InputWrapper } from "~/components/input/inputWrapper";
import { Select } from "~/components/input/select";
import { LeftData } from "~/layouts/leftData";
import { contractLoader } from "./loader";
import { useHook } from "./useHook";

export const loader = contractLoader;

export default function Index() {
  const {
    contractData,
    date,
    WorkPrice,
    PaidFrom,
    PaidTo,
    OverPrice,
    UnderPrice,
    CalcTypeValue,
    register,
    onDateUpdate,
    onSubmit,
  } = useHook();

  const RightSide = () => (
    <div className="form-wrap flex flex-1 flex-col rounded-lg bg-gray-100 p-5">
      <InputWrapper
        input={
          <Input
            register={register("Initial")}
            props={{
              placeholder: "A",
              inputMode: "url",
            }}
          />
        }
      >
        請求書作成者イニシャル
      </InputWrapper>
      <InputWrapper
        input={
          <Input
            register={register("Subject")}
            props={{
              placeholder: "開発業務",
            }}
          />
        }
      >
        件名
      </InputWrapper>
      <InputWrapper
        input={
          <Input
            register={register("Period")}
            props={{
              placeholder: "月末締め翌々月15日御支払",
            }}
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
              register={register("PaidFrom")}
              props={{
                type: "number",
                inputMode: "numeric",
                placeholder: "140",
                disabled: contractData.isFixed,
              }}
            />
            ~
            <Input
              register={register("PaidTo", { valueAsNumber: true })}
              props={{
                type: "number",
                inputMode: "numeric",
                placeholder: "180",
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
              register={register("WorkPrice")}
              props={{
                type: "number",
                inputMode: "numeric",
                placeholder: "60",
              }}
            />
          }
        >
          出単価(万)
        </InputWrapper>
        <InputWrapper
          input={
            <Select
              register={register("RoundType")}
              data={[
                { id: "round", value: "round", view: "四捨五入" },
                { id: "floor", value: "floor", view: "切り捨て" },
                { id: "ceil", value: "ceil", view: "切り上げ" },
              ]}
              props={{ disabled: contractData.isFixed }}
            />
          }
        >
          端数処理
        </InputWrapper>
        <InputWrapper
          input={
            <Input
              register={register("RoundDigit")}
              props={{
                type: "number",
                inputMode: "numeric",
                placeholder: "60",
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
              data={[
                { id: "highLow", value: "highLow", view: "上下割" },
                { id: "center", value: "center", view: "中央割" },
                { id: "other", value: "other", view: "その他" },
              ]}
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
      <button
        type="button"
        className="mt-5 h-14 rounded-md bg-secondary px-4 py-2 font-bold text-white shadow-md hover:bg-secondary-hover"
        onClick={onSubmit}
      >
        Excelを出力する
      </button>
    </div>
  );

  return (
    <div className="mx-auto px-4">
      <h1 className="mb-5 text-left font-bold text-3xl">注文書作成装置</h1>
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
    </div>
  );
}
