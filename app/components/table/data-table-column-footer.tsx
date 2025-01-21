import type { Table } from "@tanstack/react-table";

export const FooterCell = <T,>({ table }: { table: Table<T> }) => {
  const meta = table.options.meta;
  const selectedRows = table.getSelectedRowModel().rows;
  const removeRows = () => {
    meta?.removeSelectedRows(
      table.getSelectedRowModel().rows.map((row) => row.index),
    );
    table.resetRowSelection();
  };

  return (
    <div className="flex items-center justify-between space-x-4">
      {selectedRows.length > 0 ? (
        <button type="button" onClick={removeRows}>
          Remove Selected x
        </button>
      ) : null}
      <button
        onClick={meta?.addRow}
        type="button"
        className="rounded-sm bg-teal-500 p-2 font-bold"
      >
        契約情報を追加する +
      </button>
    </div>
  );
};
