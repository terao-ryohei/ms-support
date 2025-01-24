import type { CellContext } from "@tanstack/react-table";
import { useEffect, useState } from "react";

type valueType = string | boolean | number | Date | null;

export function EditableCell<T>({
  getValue,
  row,
  column,
  table,
}: CellContext<T, valueType>) {
  const initialValue = getValue();

  const [value, setValue] = useState<valueType>(initialValue);

  useEffect(() => {
    if (typeof initialValue === "number") {
      setValue(new Intl.NumberFormat("ja-JP").format(Number(initialValue)));
    } else {
      setValue(initialValue);
    }
  }, [initialValue]);

  const onBlur = () => {
    table.options.meta?.updateData(row.index, column.id, value);
  };

  const data = getValue();

  if (
    column.id === "claimRoundType" ||
    column.id === "orderRoundType" ||
    column.id === "roundType"
  ) {
    return (
      <select
        style={{ width: column.getSize() }}
        className="rounded-sm px-2 py-1"
        onChange={(e) => {
          setValue(e.target.value);
        }}
        onBlur={onBlur}
        value={value as string}
      >
        <option value="round">四捨五入</option>
        <option value="ceil">切り上げ</option>
        <option value="floor">切り捨て</option>
      </select>
    );
  }
  if (
    column.id === "claimCalcType" ||
    column.id === "orderCalcType" ||
    column.id === "calcType"
  ) {
    return (
      <select
        style={{ width: column.getSize() }}
        className="rounded-sm px-2 py-1"
        onChange={(e) => {
          setValue(e.target.value);
        }}
        onBlur={onBlur}
        value={value as string}
      >
        <option value="highLow">上下割</option>
        <option value="center">中央割</option>
        <option value="other">その他</option>
      </select>
    );
  }

  switch (typeof data) {
    case "boolean":
      return (
        <input
          type="checkbox"
          className="!bg-white rounded-sm px-2 py-1"
          checked={(value ?? false) as boolean}
          onChange={(e) => {
            setValue(e.target.checked);
          }}
          onBlur={onBlur}
        />
      );
    case "number":
    case "string":
      if (
        column.id === "claimPaidTo" ||
        column.id === "orderPaidTo" ||
        column.id === "paidTo" ||
        column.id === "claimPaidFrom" ||
        column.id === "orderPaidFrom" ||
        column.id === "paidFrom" ||
        column.id === "claimPrice" ||
        column.id === "orderPrice" ||
        column.id === "workPrice" ||
        column.id === "claimRoundDigit" ||
        column.id === "orderRoundDigit" ||
        column.id === "roundDigit"
      ) {
        return (
          <input
            style={{ width: column.getSize() - 50 }}
            placeholder="入力してください"
            className="rounded-sm px-2 py-1 text-right"
            value={(value ?? 0) as number}
            onChange={(e) =>
              setValue(
                new Intl.NumberFormat("ja-JP").format(
                  Number(e.target.value.replaceAll(/\D/g, "")),
                ),
              )
            }
            onBlur={onBlur}
            min={0}
            inputMode="numeric"
          />
        );
      }
      if (
        /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/.test(String(data))
      ) {
        return (
          <input
            style={{ width: column.getSize() }}
            type="date"
            placeholder="入力してください"
            className="rounded-sm px-2 py-1"
            value={(value ?? "") as string}
            onChange={(e) => setValue(e.target.value)}
            onBlur={onBlur}
          />
        );
      }
      return (
        <input
          style={{ width: column.getSize() }}
          placeholder="入力してください"
          className="rounded-sm px-2 py-1"
          value={(value ?? "") as string}
          onChange={(e) => setValue(e.target.value)}
          onBlur={onBlur}
        />
      );
    default:
      return (
        <input
          style={{ width: column.getSize() }}
          placeholder="入力してください"
          className="rounded-sm px-2 py-1"
          value={(value ?? "") as string}
          onChange={(e) => setValue(e.target.value)}
          onBlur={onBlur}
        />
      );
  }
}
