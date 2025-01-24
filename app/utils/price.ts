export function calcComma(price?: number | string) {
  return new Intl.NumberFormat("ja-JP", {
    style: "currency",
    currency: "JPY",
  }).format(Number(price ?? 0));
}
