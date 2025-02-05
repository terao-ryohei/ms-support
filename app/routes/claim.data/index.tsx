import { DndContext, closestCenter } from "@dnd-kit/core";
import { restrictToHorizontalAxis } from "@dnd-kit/modifiers";
import { hc } from "hono/client";
import type { AppType } from "server";
import { Input } from "~/components/input/input";
import { EditableTable } from "~/components/table/editableTable";
import { translatedArray, useHooks } from "./useHooks";
import { onSubmit } from "./submit";
import type { RoundType } from "~/types/roundType";
import { DateRangePicker } from "~/components/date-picker/date-range-picker";
import { addDays, addMonths, setDate } from "date-fns";
import { useState } from "react";
import { datePipe } from "~/utils/datePipe";

const client = hc<AppType>(import.meta.env.VITE_API_URL);

export const loader = async () => {
  const contractData = await (
    await client.api.contract.all.$get({
      query: { type: "customer" },
    })
  ).json();
  const salesData = await (await client.api.sales.$get()).json();
  const companiesData = await (await client.api.companies.$get()).json();
  const workersData = await (await client.api.workers.$get()).json();
  return { contractData, salesData, companiesData, workersData };
};

export default function Index() {
  const {
    sensors,
    table,
    columns,
    columnOrder,
    data,
    register,
    handleDragEnd,
    getValues,
  } = useHooks();

  const [dateRange, setDateRange] = useState({
    from: datePipe(setDate(new Date(), 1)),
    to: datePipe(addDays(addMonths(setDate(new Date(), 1), 1), -1)),
  });

  const onClick = async () => {
    for (const row of table.getSelectedRowModel().rows) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await onSubmit({
        row,
        roundType: data[row.index].roundType as RoundType,
        roundDigit: data[row.index].roundDigit,
        initial: getValues("initial"),
        from: dateRange.from,
        to: dateRange.to,
      });
    }
  };

  return (
    <DndContext
      collisionDetection={closestCenter}
      modifiers={[restrictToHorizontalAxis]}
      onDragEnd={handleDragEnd}
      sensors={sensors}
    >
      <div className="flex h-full flex-col space-y-4">
        <EditableTable
          table={table}
          columns={columns}
          headerList={translatedArray}
          columnOrder={columnOrder}
        />
        <div className="flex justify-end gap-2">
          <div className="flex flex-col gap-3">
            請求期間
            <DateRangePicker
              className="border border-gray-300 border-solid"
              initialDateFrom={setDate(new Date(), 1)}
              initialDateTo={addDays(addMonths(setDate(new Date(), 1), 1), -1)}
              onUpdate={({ range }) => {
                setDateRange({
                  from: datePipe(range.from),
                  to: datePipe(range.to ?? new Date()),
                });
              }}
            />
          </div>
          <div className="flex flex-col gap-1">
            作成者イニシャル
            <Input
              register={register("initial")}
              props={{ placeholder: "A" }}
            />
          </div>
          <button
            onClick={onClick}
            type="button"
            className="rounded-sm bg-orange-400 p-2 font-bold"
          >
            一括で請求書を作成する
          </button>
        </div>
      </div>
    </DndContext>
  );
}
