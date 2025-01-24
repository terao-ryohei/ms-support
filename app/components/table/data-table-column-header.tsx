import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Header } from "@tanstack/react-table";
import type { CSSProperties } from "react";
import { TableHead } from "./table";

export function DraggableTableHeader<TData>({
  header,
  className,
  data,
}: {
  header: Header<TData, unknown>;
  className: string;
  data: string;
}) {
  const { column } = header;

  const { attributes, isDragging, listeners, setNodeRef, transform } =
    useSortable({
      id: column.id,
    });

  const style: CSSProperties = {
    opacity: isDragging ? 0.8 : 1,
    transform: CSS.Translate.toString(transform),
    width: column.getSize(),
    zIndex: isDragging ? 1 : 0,
  };

  return (
    <TableHead
      colSpan={header.colSpan}
      ref={setNodeRef}
      style={style}
      className={`relative whitespace-nowrap text-center [transition:width_transform_0.2s_ease-in-out] ${className}`}
    >
      <span className="relative">
        {header.id !== "select-col" && (
          <button className="cursor-grab" {...attributes} {...listeners}>
            {data ? data : "🟰"}
          </button>
        )}
      </span>
      {column.getCanFilter() &&
        header.id !== "isHour" &&
        header.id !== "isFixed" && (
          <div className="flex gap-2">
            <input
              className="my-1 w-full rounded-sm p-1"
              placeholder="検索"
              onChange={(e) => {
                column.setFilterValue(e.target.value);
              }}
              value={(column.getFilterValue() ?? "") as string}
            />
            {header.id !== "remove" &&
              header.id !== "claim" &&
              header.id !== "order" &&
              header.id !== "select-col" && (
                <div className="flex flex-col justify-center rounded-md text-xs">
                  <button
                    className="rounded-t-md bg-white pl-0"
                    type="button"
                    onClick={() => column.toggleSorting(false)}
                  >
                    <span
                      className={`px-1 ${column.getIsSorted() === "asc" ? "text-orange-600" : "text-cyan-800"}`}
                    >
                      ▲
                    </span>
                  </button>
                  <button
                    className="rounded-b-md bg-white pl-0"
                    type="button"
                    onClick={() => column.toggleSorting(true)}
                  >
                    <span
                      className={`px-1 ${column.getIsSorted() !== "asc" ? "text-orange-600" : "text-cyan-800"}`}
                    >
                      ▼
                    </span>
                  </button>
                </div>
              )}
          </div>
        )}
    </TableHead>
  );
}
