import { DndContext, closestCenter } from "@dnd-kit/core";
import { restrictToHorizontalAxis } from "@dnd-kit/modifiers";
import { hc } from "hono/client";
import type { AppType } from "server";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "~/components/table/dropdown-menu";
import { EditableTable } from "~/components/table/editable-table";
import { translatedArray, useHooks } from "./useHooks";

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
      <div className="flex h-full flex-col space-y-4">
        <div className="flex justify-end gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md border border-gray-500 border-solid p-2 font-medium text-sm ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
              >
                表示する列を選択する
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter(
                  (column) =>
                    column.getCanHide() &&
                    Object.keys(translatedArray).includes(column.id),
                )
                .map((column) => (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {translatedArray[column.id as keyof typeof translatedArray]}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <button
            onClick={table.options.meta?.addRow}
            type="button"
            className="rounded-sm bg-secondary p-2 font-bold text-white"
          >
            新しい行を追加する
          </button>
        </div>
        <EditableTable
          table={table}
          columns={columns}
          headerList={translatedArray}
          columnOrder={columnOrder}
        />
      </div>
    </DndContext>
  );
}
