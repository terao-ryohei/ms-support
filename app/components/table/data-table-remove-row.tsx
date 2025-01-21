import type { CellContext } from "@tanstack/react-table";

export const RemoveRowCell = <T,>({ row, table }: CellContext<T, string>) => {
  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={() => table.options.meta?.removeRow(row.index)}
        type="button"
        className="mx-auto w-full text-nowrap rounded-lg bg-red-800 px-1 py-2 font-bold text-white"
      >
        削除
      </button>
    </div>
  );
};
