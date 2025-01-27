import {
  SortableContext,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  type ColumnDef,
  type Table as TableType,
  flexRender,
} from "@tanstack/react-table";
import { DraggableTableHeader } from "./data-table-column-header";
import { DragAlongCell } from "./drag-along-cell";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "./table";
import { Button } from "../input/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "./dropdown-menu";

export function EditableTable<T, U>({
  columns,
  headerList,
  table,
  columnOrder,
}: {
  columns: ColumnDef<T>[];
  headerList: U extends Record<string, string> ? U : never;
  table: TableType<T>;
  columnOrder: string[];
}) {
  return (
    <div className="flex h-full flex-col space-y-4">
      <div className="flex justify-end gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="cursor-pointer rounded-sm border border-gray-400 px-2 text-gray-600 hover:bg-gray-200"
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
                  Object.keys(headerList).includes(column.id),
              )
              .map((column) => (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  className="capitalize"
                  checked={column.getIsVisible()}
                  onCheckedChange={(value) => column.toggleVisibility(!!value)}
                >
                  {headerList[column.id as keyof typeof headerList]}
                </DropdownMenuCheckboxItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <Button props={{ onClick: table.options.meta?.addRow, type: "button" }}>
          新しい行を追加する
        </Button>
      </div>
      <Table>
        <TableHeader>
          <SortableContext
            items={columnOrder}
            strategy={horizontalListSortingStrategy}
          >
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="sticky top-[0] left-[0]"
              >
                {headerGroup.headers.map((header) => (
                  <DraggableTableHeader
                    key={header.id}
                    header={header}
                    data={headerList[header.id as keyof typeof headerList]}
                  />
                ))}
              </TableRow>
            ))}
          </SortableContext>
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
              >
                {row.getVisibleCells().map((cell) => {
                  const { id, column, getContext } = cell;
                  return column.getIsPinned() === "left" ? (
                    <TableCell key={id}>
                      {flexRender(column.columnDef.cell, getContext())}
                    </TableCell>
                  ) : (
                    <SortableContext
                      key={id}
                      items={columnOrder}
                      strategy={horizontalListSortingStrategy}
                    >
                      <DragAlongCell key={id} cell={cell} />
                    </SortableContext>
                  );
                })}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24">
                データがありません
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
