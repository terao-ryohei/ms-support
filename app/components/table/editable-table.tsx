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

export const EditableTable = <T, U>({
  columns,
  headerList,
  table,
  columnOrder,
}: {
  columns: ColumnDef<T>[];
  headerList: U extends Record<string, string> ? U : never;
  table: TableType<T>;
  columnOrder: string[];
}) => (
  <div className="mx-auto h-full w-full min-w-[800px] flex-grow overflow-auto rounded-md border">
    <Table className="h-[80%] w-[90%] overflow-y-auto">
      <TableHeader>
        <SortableContext
          items={columnOrder}
          strategy={horizontalListSortingStrategy}
        >
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="sticky top-[0] left-[0]">
              {headerGroup.headers.map((header) => (
                <DraggableTableHeader
                  key={header.id}
                  header={header}
                  data={headerList[header.id as keyof typeof headerList]}
                  className="border-gray-200 border-b border-solid"
                />
              ))}
            </TableRow>
          ))}
        </SortableContext>
      </TableHeader>
      <TableBody className="overflow-y-auto">
        {table.getRowModel().rows?.length ? (
          table.getRowModel().rows.map((row) => (
            <TableRow
              key={row.id}
              data-state={row.getIsSelected() && "selected"}
            >
              {row.getVisibleCells().map((cell) => {
                const { id, column, getContext } = cell;
                return column.getIsPinned() === "left" ? (
                  <TableCell
                    key={id}
                    className="border-border border-b border-solid bg-white"
                  >
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
            <TableCell colSpan={columns.length} className="h-24 text-center">
              データがありません
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  </div>
);
