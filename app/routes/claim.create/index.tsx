import { Input } from "~/components/input/input";
import { InputWrapper } from "~/components/input/inputWrapper";
import { Select } from "~/components/input/select";
import { LeftData } from "~/layouts/leftData";
import { contractLoader } from "./loader";
import { useHook } from "./useHooks";

export const loader = contractLoader;

export default function Index() {
  const {
    contractData,
    OverPrice,
    UnderPrice,
    WorkPrice,
    PaidFrom,
    PaidTo,
    CalcTypeValue,
    register,
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
              type: "date",
            }}
          />
        }
      >
        支払期日
      </InputWrapper>
      <InputWrapper
        input={
          <div className="range mb-2 flex items-center gap-2">
            <Input register={register("ClaimFrom")} props={{ type: "date" }} />
            ~
            <Input register={register("ClaimTo")} props={{ type: "date" }} />
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
                inputMode: "numeric",
                placeholder: "140",
                disabled: contractData.isHour || contractData.isFixed,
              }}
            />
            ~
            <Input
              register={register("PaidTo", { valueAsNumber: true })}
              props={{
                type: "number",
                inputMode: "numeric",
                placeholder: "180",
                disabled: contractData.isHour || contractData.isFixed,
              }}
            />
          </div>
        }
      >
        清算幅(h)
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
          入単価
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
              register={register("RoundDigit", { valueAsNumber: true })}
              props={{
                type: "number",
                inputMode: "numeric",
                placeholder: "1",
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
      <div className="mb-5 grid grid-cols-3 gap-5">
        <InputWrapper
          input={
            <Input
              register={register("WorkTime", { valueAsNumber: true })}
              props={{
                type: "number",
                inputMode: "numeric",
                placeholder: "1.0",
              }}
            />
          }
        >
          {contractData.isHour ? "作業人時" : "作業人月"}
        </InputWrapper>
        <InputWrapper
          input={
            <Input
              register={register("OverTime", { valueAsNumber: true })}
              props={{
                type: "number",
                inputMode: "numeric",
                placeholder: "0.0",
                disabled: contractData.isFixed,
              }}
            />
          }
        >
          超過工数(h)
        </InputWrapper>
        <InputWrapper
          input={
            <Input
              register={register("UnderTime", { valueAsNumber: true })}
              props={{
                type: "number",
                inputMode: "numeric",
                placeholder: "0.0",
                disabled: contractData.isFixed,
              }}
            />
          }
        >
          控除工数(h)
        </InputWrapper>
      </div>
      <InputWrapper
        input={
          <Input
            register={register("OtherPrice", { valueAsNumber: true })}
            props={{
              type: "number",
              inputMode: "numeric",
              placeholder: "0",
              disabled: contractData.isFixed,
            }}
          />
        }
      >
        その他費用
      </InputWrapper>
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
      <h1 className="mb-5 text-left font-bold text-3xl">請求書作成装置</h1>
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
