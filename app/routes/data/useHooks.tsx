import { useLoaderData } from "react-router";
import { compareItems, rankItem } from "@tanstack/match-sorter-utils";
import {
  type SortingState,
  type ColumnFiltersState,
  type VisibilityState,
  type RowSelectionState,
  type SortingFn,
  sortingFns,
  type FilterFn,
  type ColumnDef,
  type CellContext,
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
} from "@tanstack/react-table";
import { useState, useCallback, useMemo } from "react";
import { EditableCell } from "~/components/table/editableCell";
import { useToast } from "~/components/toast/toastProvider";
import type { loader } from ".";
import type { AppType } from "server";
import { hc } from "hono/client";

export const translatedArray = {
  id: "契約ID",
  name: "名前",
  isDisable: "表示",
};

const client = hc<AppType>(import.meta.env.VITE_API_URL);

export const useHooks = () => {
  const { salesData, companiesData, workersData } =
    useLoaderData<typeof loader>();
  type SalesData = typeof salesData extends (infer U)[] ? U : never;
  type CompaniesData = typeof companiesData extends (infer U)[] ? U : never;
  type WorkersData = typeof workersData extends (infer U)[] ? U : never;

  const openToast = useToast();

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [columnOrder, setColumnOrder] = useState<string[]>([
    ...Object.keys(translatedArray),
    "remove",
  ]);

  const onUpdate = useCallback(
    async ({
      rowIndex,
      type,
      columnId,
      value,
    }: {
      rowIndex: number;
      type: "sales" | "companies" | "workers";
      columnId: string;
      value: string | boolean;
    }) => {
      console.log(rowIndex, type);
      switch (type) {
        case "sales": {
          if (columnId === "isDisable") {
            await client.api.sales.$put({
              json: {
                id: salesData[rowIndex].id,
                values: { isDisable: !value },
              },
            });
            break;
          }
          await client.api.sales.$put({
            json: { id: salesData[rowIndex].id, values: { [columnId]: value } },
          });
          break;
        }
        case "companies": {
          if (columnId === "isDisable") {
            await client.api.companies.$put({
              json: {
                id: companiesData[rowIndex].id,
                values: { isDisable: !value },
              },
            });
            break;
          }
          await client.api.companies.$put({
            json: {
              id: companiesData[rowIndex].id,
              values: { [columnId]: value },
            },
          });
          break;
        }
        case "workers": {
          if (columnId === "isDisable") {
            await client.api.workers.$put({
              json: {
                id: workersData[rowIndex].id,
                values: { isDisable: !value },
              },
            });
            break;
          }
          await client.api.workers.$put({
            json: {
              id: workersData[rowIndex].id,
              values: { [columnId]: value },
            },
          });
          break;
        }
      }
      openToast({
        type: "success",
        title: "更新しました",
        duration: 2000,
      });
    },
    [openToast, salesData, companiesData, workersData],
  );

  const fuzzySort: SortingFn<SalesData | CompaniesData | WorkersData> =
    useCallback((rowA, rowB, columnId) => {
      const dir = rowA.columnFiltersMeta[columnId]
        ? compareItems(
            rowA.columnFiltersMeta[columnId].itemRank,
            rowB.columnFiltersMeta[columnId].itemRank,
          )
        : sortingFns.alphanumeric(rowA, rowB, columnId);
      return dir === 0 ? sortingFns.alphanumeric(rowA, rowB, columnId) : dir;
    }, []);

  const fuzzyFilter: FilterFn<SalesData | CompaniesData | WorkersData> =
    useCallback((row, columnId, value, addMeta) => {
      const itemRank = rankItem(row.getValue(columnId), value);
      addMeta({ itemRank });
      return itemRank.passed;
    }, []);

  const columns: ColumnDef<SalesData | CompaniesData | WorkersData>[] = useMemo(
    () => [
      ...Object.values(translatedArray).map((_, i) => {
        return {
          accessorKey: Object.keys(translatedArray)[i],
          id: Object.keys(translatedArray)[i],
          sortingFn: fuzzySort,
          cell: (
            c: CellContext<SalesData | CompaniesData | WorkersData, string>,
          ) => {
            if (c.column.id !== "id") {
              return EditableCell(c);
            }
            return <>{c.cell.getValue()}</>;
          },
        };
      }),
    ],
    [fuzzySort],
  );

  const table = (type: "sales" | "companies" | "workers") => {
    let data: SalesData[] | CompaniesData[] | WorkersData[] = salesData;

    if (type === "companies") {
      data = companiesData;
    }
    if (type === "workers") {
      data = workersData;
    }

    return useReactTable({
      data,
      columns,
      enableRowSelection: true,
      filterFns: { fuzzy: fuzzyFilter },
      state: {
        sorting,
        columnFilters,
        columnVisibility,
        columnOrder,
        rowSelection,
      },
      onRowSelectionChange: setRowSelection,
      getCoreRowModel: getCoreRowModel(),
      onSortingChange: setSorting,
      getSortedRowModel: getSortedRowModel(),
      onColumnFiltersChange: setColumnFilters,
      getFilteredRowModel: getFilteredRowModel(),
      onColumnVisibilityChange: setColumnVisibility,
      onColumnOrderChange: setColumnOrder,
      meta: {
        updateData: (
          rowIndex: number,
          columnId: string,
          value: string | boolean,
        ) => {
          onUpdate({ rowIndex, type, columnId, value });
        },
        addRow: () => {},
        removeRow: () => {},
        removeSelectedRows: () => {},
      },
    });
  };

  return {
    table,
    columns,
    columnOrder,
  };
};
