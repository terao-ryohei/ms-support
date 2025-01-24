import { useSortable } from "@dnd-kit/sortable";
import { type Cell, flexRender } from "@tanstack/react-table";
import type { CSSProperties } from "react";
import { TableCell } from "./table";
import { CSS } from "@dnd-kit/utilities";

export function DragAlongCell<TData>({ cell }: { cell: Cell<TData, unknown> }) {
  const { isDragging, setNodeRef, transform } = useSortable({
    id: cell.column.id,
  });

  const style: CSSProperties = {
    opacity: isDragging ? 0.8 : 1,
    transform: CSS.Translate.toString(transform),
    width: cell.column.getSize(),
    zIndex: isDragging ? 1 : 0,
  };

  return (
    <TableCell style={style} ref={setNodeRef}>
      {flexRender(cell.column.columnDef.cell, cell.getContext())}
    </TableCell>
  );
}
