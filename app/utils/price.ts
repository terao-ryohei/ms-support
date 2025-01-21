export const calcComma = (price?: number | string) =>
  new Intl.NumberFormat("ja-JP", {
    style: "currency",
    currency: "JPY",
  }).format(Number(price ?? 0));
