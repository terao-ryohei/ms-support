import { DndContext, closestCenter } from "@dnd-kit/core";
import { restrictToHorizontalAxis } from "@dnd-kit/modifiers";
import { hc } from "hono/client";
import type { AppType } from "server";
import { EditableTable } from "~/components/table/editableTable";
import { translatedArray, useHooks } from "./useHooks";
import type { MetaFunction } from "@remix-run/react";

export const meta: MetaFunction = () => [{ title: "契約者一覧" }];

const client = hc<AppType>(import.meta.env.VITE_API_URL);

export const loader = async () => {
  const contractData = await (await client.api.contract.payment.$get()).json();
  const salesData = await (await client.api.sales.$get()).json();
  const companiesData = await (await client.api.companies.$get()).json();
  const workersData = await (await client.api.workers.$get()).json();
  return { contractData, salesData, companiesData, workersData };
};

export default function Index() {
  const { sensors, table, columns, columnOrder, handleDragEnd } = useHooks();

  return (
    <DndContext
      collisionDetection={closestCenter}
      modifiers={[restrictToHorizontalAxis]}
      onDragEnd={handleDragEnd}
      sensors={sensors}
    >
      <EditableTable
        table={table}
        columns={columns}
        headerList={translatedArray}
        columnOrder={columnOrder}
      />
    </DndContext>
  );
}
