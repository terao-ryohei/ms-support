import {
  type DragEndEvent,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { Link, useLoaderData } from "@remix-run/react";
import { compareItems, rankItem } from "@tanstack/match-sorter-utils";
import {
  type CellContext,
  type ColumnDef,
  type ColumnFiltersState,
  type FilterFn,
  type RowSelectionState,
  type SortingFn,
  type SortingState,
  type VisibilityState,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  sortingFns,
  useReactTable,
} from "@tanstack/react-table";
import { hc } from "hono/client";
import { useCallback, useMemo, useState } from "react";
import { useRemixForm } from "remix-hook-form";
import type { AppType } from "server";
import { EditableCell } from "~/components/table/data-table-editable-row";
import { EditableList } from "~/components/table/editable-list";
import { useToast } from "~/components/toast/toastProvider";
import { defaultData } from "~/constants/default";
import type { CalcType } from "~/types/calcType";
import type { RoundType } from "~/types/roundType";
import { calcPrice } from "~/utils/calcPrice";
import type { loader } from ".";

const translatedArray = {
  id: "契約ID",
  isHour: "時給",
  isFixed: "固定",
  worker: "作業者名",
  company: "顧客",
  sales: "営業担当",
  subject: "案件名",
  periodDate: "支払期日",
  workPrice: "出単価",
  paidFrom: "清算幅（下限）",
  paidTo: "清算幅（上限）",
  calcType: "超過控除の計算",
  overPrice: "超過単価",
  underPrice: "控除単価",
};

const client = hc<AppType>(import.meta.env.VITE_API_URL);

export const useHooks = () => {
  const { contractData, salesData, companiesData, workersData } =
    useLoaderData<typeof loader>();
  type ContractData = typeof contractData extends (infer U)[] ? U : never;

  const { register, getValues } = useRemixForm<{ initial: string }>({
    defaultValues: { initial: "" },
  });

  const [data, setData] = useState<typeof contractData>(contractData);
  const [salesList, setSalesList] = useState<typeof salesData>(salesData);
  const [companiesList, setCompaniesList] =
    useState<typeof companiesData>(companiesData);
  const [workersList, setWorkersList] =
    useState<typeof workersData>(workersData);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [columnOrder, setColumnOrder] = useState<string[]>([
    "select-col",
    "claim",
    ...Object.keys(translatedArray),
  ]);

  const openToast = useToast();

  const onUpdate = useCallback(
    (columnId: string, value: string, type: "更新" | "追加" | "削除") => {
      openToast({
        type: "success",
        title: `${type}しました`,
        description: `${translatedArray[columnId as keyof typeof translatedArray]}: ${value}`,
        duration: 2000,
      });
    },
    [openToast],
  );

  const fuzzySort: SortingFn<ContractData> = useCallback(
    (rowA, rowB, columnId) => {
      const dir = rowA.columnFiltersMeta[columnId]
        ? compareItems(
            rowA.columnFiltersMeta[columnId].itemRank,
            rowB.columnFiltersMeta[columnId].itemRank,
          )
        : sortingFns.alphanumeric(rowA, rowB, columnId);
      return dir === 0 ? sortingFns.alphanumeric(rowA, rowB, columnId) : dir;
    },
    [],
  );

  const fuzzyFilter: FilterFn<ContractData> = useCallback(
    (row, columnId, value, addMeta) => {
      const itemRank = rankItem(row.getValue(columnId), value);
      addMeta({ itemRank });
      return itemRank.passed;
    },
    [],
  );

  const columns: ColumnDef<ContractData>[] = useMemo(
    () => [
      {
        id: "select-col",
        cell: ({ row }) => (
          <input
            type="checkbox"
            checked={row.getIsSelected()}
            disabled={!row.getCanSelect()}
            onChange={row.getToggleSelectedHandler()}
          />
        ),
      },
      {
        id: "claim",
        cell: (c: CellContext<ContractData, string>) => (
          <div className="flex items-center space-x-2">
            <Link
              to={`/claim/create/?id=${c.row.getValue("id")}`}
              className="mx-auto w-full text-nowrap rounded-lg bg-orange-400 px-1 py-2 font-bold"
            >
              請求書
            </Link>
          </div>
        ),
      },

      ...Object.values(translatedArray).map((_, i) => {
        return {
          accessorKey: Object.keys(translatedArray)[i],
          id: Object.keys(translatedArray)[i],
          cell: (c: CellContext<ContractData, string>) => {
            switch (c.column.id) {
              case "id":
                return <span>{c.cell.getValue()}</span>;
              case "sales":
                return (
                  <EditableList
                    data={salesList}
                    value={data[c.row.index].salesId ?? 0}
                    onChange={(value: string) => {
                      client.api.relation.$put({
                        json: {
                          id: data[c.row.index].id,
                          mode: "customer",
                          type: "salesId",
                          value: Number(value),
                        },
                      });
                      onUpdate(
                        c.column.id,
                        salesList[
                          salesList.findIndex(
                            (data) => data.id === Number(value),
                          )
                        ].name,
                        "更新",
                      );
                    }}
                    onAdd={async (value: string) => {
                      const res = await (
                        await client.api.sales.$post({
                          json: {
                            name: value,
                          },
                        })
                      ).json();
                      setSalesList((list) => [...list, ...res]);
                      onUpdate(c.column.id, value, "追加");
                    }}
                    onDelete={async (value: number) => {
                      await (
                        await client.api.sales.$delete({
                          json: {
                            id: value,
                          },
                        })
                      ).json();
                      setSalesList((list) =>
                        list.filter(({ id }) => id !== value),
                      );
                      onUpdate(
                        c.column.id,
                        salesList[
                          salesList.findIndex(
                            (data) => data.id === Number(value),
                          )
                        ].name,
                        "削除",
                      );
                    }}
                  />
                );
              case "company":
                return (
                  <EditableList
                    data={companiesList}
                    value={data[c.row.index].companyId ?? 0}
                    onChange={(value: string) => {
                      client.api.relation.$put({
                        json: {
                          id: data[c.row.index].id,
                          mode: "customer",
                          type: "companyId",
                          value: Number(value),
                        },
                      });
                      onUpdate(
                        c.column.id,
                        companiesList[
                          companiesList.findIndex(
                            (data) => data.id === Number(value),
                          )
                        ].name,
                        "更新",
                      );
                    }}
                    onAdd={async (value: string) => {
                      const res = await (
                        await client.api.companies.$post({
                          json: {
                            name: value,
                          },
                        })
                      ).json();
                      setCompaniesList((list) => [...list, ...res]);
                      onUpdate(c.column.id, value, "追加");
                    }}
                    onDelete={async (value: number) => {
                      await (
                        await client.api.companies.$delete({
                          json: {
                            id: value,
                          },
                        })
                      ).json();
                      setCompaniesList((list) =>
                        list.filter(({ id }) => id !== value),
                      );
                      onUpdate(
                        c.column.id,
                        companiesList[
                          companiesList.findIndex(
                            (data) => data.id === Number(value),
                          )
                        ].name,
                        "削除",
                      );
                    }}
                  />
                );
              case "worker":
                return (
                  <EditableList
                    data={workersList}
                    value={data[c.row.index].workerId ?? 0}
                    onChange={(value: string) => {
                      client.api.relation.$put({
                        json: {
                          id: data[c.row.index].id,
                          mode: "customer",
                          type: "workerId",
                          value: Number(value),
                        },
                      });
                      onUpdate(
                        c.column.id,
                        workersList[
                          workersList.findIndex(
                            (data) => data.id === Number(value),
                          )
                        ].name,
                        "更新",
                      );
                    }}
                    onAdd={async (value: string) => {
                      const res = await (
                        await client.api.workers.$post({
                          json: {
                            name: value,
                          },
                        })
                      ).json();
                      setWorkersList((list) => [...list, ...res]);
                      onUpdate(c.column.id, value, "追加");
                    }}
                    onDelete={async (value: number) => {
                      await (
                        await client.api.workers.$delete({
                          json: {
                            id: value,
                          },
                        })
                      ).json();
                      setWorkersList((list) =>
                        list.filter(({ id }) => id !== value),
                      );
                      onUpdate(
                        c.column.id,
                        workersList[
                          workersList.findIndex(
                            (data) => data.id === Number(value),
                          )
                        ].name,
                        "削除",
                      );
                    }}
                  />
                );
              default:
                return EditableCell(c);
            }
          },
          sortingFn: fuzzySort,
          size: Object.keys(translatedArray)[i] === "subject" ? 300 : undefined,
        };
      }),
    ],
    [fuzzySort, onUpdate, data, salesList, companiesList, workersList],
  );

  const updateData = useCallback(
    async (rowIndex: number, columnId: string, value: string) => {
      if (value === null || value === "") {
        return;
      }

      if (
        columnId === "calcType" ||
        columnId === "price" ||
        columnId === "paidTo" ||
        columnId === "paidFrom" ||
        columnId === "roundType" ||
        columnId === "roundDigit"
      ) {
        const { overPrice, underPrice } = calcPrice({
          workPrice: data[rowIndex].workPrice,
          from: data[rowIndex].paidFrom,
          to: data[rowIndex].paidTo,
          roundType: data[rowIndex].roundType as RoundType,
          roundDigit: data[rowIndex].roundDigit,
          calcType: value as CalcType,
        });
        setData((data) => {
          data[rowIndex].overPrice = overPrice;
          data[rowIndex].underPrice = underPrice;
          return data;
        });
        await client.api.payment.$put({
          json: {
            values: {
              overPrice,
              underPrice,
            },
            id: data[rowIndex].id,
          },
        });
      }

      switch (columnId) {
        case "sales":
        case "company":
        case "worker":
          break;
        case "workPrice":
        case "paidFrom":
        case "paidTo":
        case "roundDigit":
          await client.api.payment.$put({
            json: {
              values: { [columnId]: Number(value.replaceAll(/\D/g, "")) },
              id: data[rowIndex].paymentId,
            },
          });
          break;
        case "subject":
        case "document":
        case "contractType":
          await client.api.contract.$put({
            json: { values: { [columnId]: value }, id: data[rowIndex].id },
          });
          break;
        default:
          await client.api.payment.$put({
            json: {
              values: { [columnId]: value },
              id: data[rowIndex].paymentId,
            },
          });
          break;
      }
      setData((old) =>
        old.map((row, index) => {
          if (index === rowIndex) {
            return {
              ...old[rowIndex],
              [columnId]: value,
            };
          }
          return row;
        }),
      );
      onUpdate(columnId, value, "更新");
    },
    [data, onUpdate],
  );

  const addRow = async () => {
    await client.api.contract.$post({
      json: {
        contract: {
          worker: defaultData.worker,
          company: defaultData.company,
          sales: defaultData.sales,
          from: defaultData.contractRange.split("~")[0],
          to: defaultData.contractRange.split("~")[1],
          contractType: defaultData.contractType,
          subject: defaultData.subject,
          document: defaultData.document,
        },
        payment: {
          paidFrom: defaultData.paidFrom,
          paidTo: defaultData.paidTo,
          isHour: defaultData.isHour,
          periodDate: defaultData.periodDate,
          workPrice: defaultData.workPrice,
          roundDigit: defaultData.roundDigit,
          roundType: defaultData.roundType,
          calcType: defaultData.calcType,
          overPrice: defaultData.overPrice,
          underPrice: defaultData.underPrice,
          isFixed: defaultData.isFixed,
        },
      },
    });
    await (await client.api.contract.all.$get({ query: { type: "customer" } }))
      .json()
      .then((newData) => {
        setData(newData);
      });
  };

  const table = useReactTable({
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
      updateData,
      addRow,
      removeRow: () => {},
      removeSelectedRows: () => {},
    },
  });

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active && over && active.id !== over.id) {
      setColumnOrder((columnOrder) => {
        const oldIndex = columnOrder.indexOf(active.id as string);
        const newIndex = columnOrder.indexOf(over.id as string);
        return arrayMove(columnOrder, oldIndex, newIndex); //this is just a splice util
      });
    }
  };

  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {}),
  );

  return {
    sensors,
    table,
    columns,
    columnOrder,
    data,
    register,
    handleDragEnd,
    getValues,
  };
};
