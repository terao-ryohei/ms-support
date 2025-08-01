import { DndContext, closestCenter } from "@dnd-kit/core";
import { restrictToHorizontalAxis } from "@dnd-kit/modifiers";
import { hc } from "hono/client";
import type { AppType } from "server";
import type { RoundType } from "server/api/order/excel";
import { EditableTable } from "~/components/table/editableTable";
import { Input } from "~/components/input/input";
import { onSubmit } from "./submit";
import { translatedArray, useHooks } from "./useHooks";
import type { MetaFunction } from "react-router";
import { useId } from "react";

export const meta: MetaFunction = () => [{ title: "注文書作成装置" }];

const client = hc<AppType>(import.meta.env.VITE_API_URL);

export const loader = async () => {
  const contractData = await (
    await client.api.contract.all.$get({
      query: { type: "partner" },
    })
  ).json();
  const salesData = await (await client.api.sales.$get()).json();
  const companiesData = await (await client.api.companies.$get()).json();
  const workersData = await (await client.api.workers.$get()).json();
  return { contractData, salesData, companiesData, workersData };
};

export default function Index() {
  const dndContextId = useId();

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

  const onClick = async () => {
    for (const row of table.getSelectedRowModel().rows) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await onSubmit({
        row,
        roundType: data[row.index].roundType as RoundType,
        roundDigit: data[row.index].roundDigit,
        initial: getValues("initial"),
      });
    }
  };

  return (
    <DndContext
      id={dndContextId}
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
            className="rounded-sm bg-yellow-400 p-2 font-bold"
          >
            一括で注文書を作成する
          </button>
        </div>
      </div>
    </DndContext>
  );
}
