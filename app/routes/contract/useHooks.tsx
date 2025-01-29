import {
  type DragEndEvent,
  useSensors,
  useSensor,
  MouseSensor,
  TouchSensor,
  KeyboardSensor,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { useLoaderData } from "@remix-run/react";
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
import { DateRangePicker } from "~/components/date-picker/date-range-picker";
import { EditableCell } from "~/components/table/data-table-editable-row";
import { RemoveRowCell } from "~/components/table/data-table-remove-row";
import { EditableList } from "~/components/table/editable-list";
import { useToast } from "~/components/toast/toastProvider";
import { defaultData } from "~/constants/default";
import { datePipe } from "~/utils/datePipe";
import { calcComma } from "~/utils/price";
import type { loader } from ".";
import type { AppType } from "server";
import { hc } from "hono/client";

export const translatedArray = {
  id: "契約ID",
  worker: "作業者名",
  claimSales: "営業担当",
  orderSales: "要員担当",
  claimCompany: "顧客",
  orderCompany: "所属",
  subject: "案件名",
  contractRange: "契約期間",
  claimPrice: "入単価",
  orderPrice: "出単価",
  profit: "粗利",
  profitRatio: "粗利率",
  claimIsHour: "入時給",
  claimIsFixed: "入固定",
  claimPaidTo: "入清算上限",
  claimPaidFrom: "入清算下限",
  claimRoundType: "入丸めタイプ",
  claimRoundDigit: "入丸め桁",
  claimPeriodDate: "入金期日",
  orderIsHour: "出時給",
  orderIsFixed: "出固定",
  orderPaidTo: "出清算上限",
  orderPaidFrom: "出清算下限",
  orderRoundType: "出丸めタイプ",
  orderRoundDigit: "出丸め桁",
  orderPeriodDate: "出金期日",
};

const client = hc<AppType>(import.meta.env.VITE_API_URL);

export const useHooks = () => {
  const { contractData, salesData, companiesData, workersData } =
    useLoaderData<typeof loader>();
  type ContractData = typeof contractData extends (infer U)[] ? U : never;

  const openToast = useToast();

  const [data, setData] = useState(
    contractData.map((data) => ({
      ...data,
      claimPrice: data.claimPayment.workPrice,
      orderPrice: data.orderPayment.workPrice,
      claimPaidTo: data.claimPayment.paidTo,
      claimPaidFrom: data.claimPayment.paidFrom,
      claimRoundType: data.claimPayment.roundType,
      claimRoundDigit: data.claimPayment.roundDigit,
      orderPaidTo: data.orderPayment.paidTo,
      orderPaidFrom: data.orderPayment.paidFrom,
      orderRoundType: data.orderPayment.roundType,
      orderRoundDigit: data.orderPayment.roundDigit,
      claimPeriodDate: data.claimPayment.periodDate,
      orderPeriodDate: data.orderPayment.periodDate,
      claimIsHour: data.claimPayment.isHour,
      claimIsFixed: data.claimPayment.isFixed,
      orderIsHour: data.orderPayment.isHour,
      orderIsFixed: data.orderPayment.isFixed,
    })),
  );
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
    ...Object.keys(translatedArray),
    "remove",
  ]);

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
      ...Object.values(translatedArray).map((_, i) => {
        return {
          accessorKey: Object.keys(translatedArray)[i],
          id: Object.keys(translatedArray)[i],
          cell: (c: CellContext<ContractData, string>) => {
            switch (c.column.id) {
              case "id":
                return <span>{c.cell.getValue()}</span>;
              case "profit":
                return (
                  <div>
                    {calcComma(
                      Number(
                        String(c.row.getValue("claimPrice")).replaceAll(
                          /\D/g,
                          "",
                        ),
                      ) -
                        Number(
                          String(c.row.getValue("orderPrice")).replaceAll(
                            /\D/g,
                            "",
                          ),
                        ),
                    )}
                  </div>
                );
              case "profitRatio":
                return (
                  <div>
                    {Math.round(
                      ((Number(
                        String(c.row.getValue("claimPrice")).replaceAll(
                          /\D/g,
                          "",
                        ),
                      ) -
                        Number(
                          String(c.row.getValue("orderPrice")).replaceAll(
                            /\D/g,
                            "",
                          ),
                        )) /
                        Number(
                          String(c.row.getValue("claimPrice")).replaceAll(
                            /\D/g,
                            "",
                          ),
                        )) *
                        100 *
                        10 ** 3,
                    ) /
                      10 ** 3}
                    %
                  </div>
                );
              case "claimSales":
              case "orderSales":
                return (
                  <EditableList
                    data={salesList}
                    value={
                      (c.column.id === "claimSales"
                        ? data[c.row.index].claimSalesId
                        : data[c.row.index].orderSalesId) ?? 0
                    }
                    onChange={(value: string) => {
                      client.api.relation.$put({
                        json: {
                          id: data[c.row.index].id,
                          mode:
                            c.column.id === "claimSales"
                              ? "customer"
                              : "partner",
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
              case "claimCompany":
              case "orderCompany":
                return (
                  <EditableList
                    data={companiesList}
                    value={
                      (c.column.id === "claimCompany"
                        ? data[c.row.index].claimCompanyId
                        : data[c.row.index].orderCompanyId) ?? 0
                    }
                    onChange={(value: string) => {
                      client.api.relation.$put({
                        json: {
                          id: data[c.row.index].id,
                          mode:
                            c.column.id === "claimCompany"
                              ? "customer"
                              : "partner",
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
                          mode:
                            c.column.id === "claimCompany"
                              ? "customer"
                              : "partner",
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
              case "contractRange":
                return (
                  <DateRangePicker
                    initialDateFrom={c.cell.getValue().split("~")[0]}
                    initialDateTo={c.cell.getValue().split("~")[1]}
                    onUpdate={({ range: { from, to } }) => {
                      if (from && to) {
                        client.api.contract.$put({
                          json: {
                            id: data[c.row.index].id,
                            values: { from: datePipe(from), to: datePipe(to) },
                          },
                        });
                        onUpdate(
                          c.column.id,
                          `${datePipe(from)}~${datePipe(to)}`,
                          "更新",
                        );
                      }
                    }}
                  />
                );
              default:
                return EditableCell(c);
            }
          },
          sortingFn: fuzzySort,
        };
      }),
      {
        id: "remove",
        cell: RemoveRowCell,
      },
    ],
    [fuzzySort, onUpdate, data, salesList, companiesList, workersList],
  );

  const updateData = useCallback(
    async (rowIndex: number, columnId: string, value: string) => {
      if (value === null || value === "") {
        return;
      }
      switch (columnId) {
        case "claimSales":
        case "orderSales":
        case "claimCompany":
        case "orderCompany":
        case "worker":
          break;
        case "claimPrice":
        case "claimPaidFrom":
        case "claimPaidTo":
        case "claimRoundDigit": {
          let columnName =
            columnId.replaceAll("claim", "")[0].toLowerCase() +
            columnId.replaceAll("claim", "").slice(1);
          if (columnName === "price") {
            columnName = "workPrice";
          }
          await client.api.payment.$put({
            json: {
              values: {
                [columnName]: Number(value.replaceAll(/\D/g, "")),
              },
              id: data[rowIndex].claimPayment.paymentId,
            },
          });
          break;
        }
        case "orderPrice":
        case "orderPaidFrom":
        case "orderPaidTo":
        case "orderRoundDigit": {
          let columnName =
            columnId.replaceAll("order", "")[0].toLowerCase() +
            columnId.replaceAll("order", "").slice(1);
          if (columnName === "price") {
            columnName = "workPrice";
          }
          await client.api.payment.$put({
            json: {
              values: {
                [columnName]: Number(value.replaceAll(/\D/g, "")),
              },
              id: data[rowIndex].orderPayment.paymentId,
            },
          });
          break;
        }
        case "contractRange":
          await client.api.contract.$put({
            json: {
              values: { from: value.split("~")[0], to: value.split("~")[1] },
              id: data[rowIndex].id,
            },
          });
          break;
        case "claimRoundType":
        case "claimPeriodDate": {
          const columnName =
            columnId.replaceAll("claim", "")[0].toLowerCase() +
            columnId.replaceAll("claim", "").slice(1);
          await client.api.payment.$put({
            json: {
              values: {
                [columnName]: value,
              },
              id: data[rowIndex].claimPayment.paymentId,
            },
          });
          break;
        }
        case "orderRoundType":
        case "orderPeriodDate": {
          const columnName =
            columnId.replaceAll("order", "")[0].toLowerCase() +
            columnId.replaceAll("order", "").slice(1);
          await client.api.payment.$put({
            json: {
              values: {
                [columnName]: value,
              },
              id: data[rowIndex].orderPayment.paymentId,
            },
          });
          break;
        }
        default:
          await client.api.contract.$put({
            json: { values: { [columnId]: value }, id: data[rowIndex].id },
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
    await (
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
      })
    ).json();

    await (await client.api.contract.payment.$get()).json().then((newData) => {
      setData(
        newData.map((data) => ({
          ...data,
          claimPrice: data.claimPayment.workPrice,
          orderPrice: data.orderPayment.workPrice,
          claimPaidTo: data.claimPayment.paidTo,
          claimPaidFrom: data.claimPayment.paidFrom,
          claimRoundType: data.claimPayment.roundType,
          claimRoundDigit: data.claimPayment.roundDigit,
          orderPaidTo: data.orderPayment.paidTo,
          orderPaidFrom: data.orderPayment.paidFrom,
          orderRoundType: data.orderPayment.roundType,
          orderRoundDigit: data.orderPayment.roundDigit,
          claimPeriodDate: data.claimPayment.periodDate,
          orderPeriodDate: data.orderPayment.periodDate,
          orderIsHour: data.orderPayment.isHour,
          orderIsFixed: data.orderPayment.isFixed,
          claimIsHour: data.claimPayment.isHour,
          claimIsFixed: data.claimPayment.isFixed,
        })),
      );
    });
  };

  const removeRow = async (rowIndex: number) => {
    await client.api.contract.$delete({ json: { id: data[rowIndex].id } });
    setData((old) => old.filter((_row, index) => index !== rowIndex));
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
      removeRow,
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
    handleDragEnd,
  };
};
