import type { FilterFn, RankingInfo, Updater } from "@tanstack/react-table";

declare module "@tanstack/react-table" {
  //add fuzzy filter to the filterFns
  interface FilterFns {
    fuzzy: FilterFn<unknown>;
  }
  interface FilterMeta {
    itemRank: RankingInfo;
  }
  interface TableMeta {
    updateData: Updater;
    addRow: () => void;
    removeRow: (index: number) => void;
    removeSelectedRows: (row: number[]) => void;
  }
}
