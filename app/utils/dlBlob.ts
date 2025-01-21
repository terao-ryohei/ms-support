import type { ClientResponse } from "hono/client";
import type { StatusCode } from "hono/utils/http-status";

export const dlBlob = async <T>({
  response,
  worker,
  type,
}: {
  response: ClientResponse<T, StatusCode>;
  worker: string;
  type: "order" | "claim" | "quote";
}) => {
  const blob = await response.blob();

  // ダウンロードリンクを作成
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");

  let title = "請求";
  if (type === "order") title = "注文";
  if (type === "quote") title = "見積";

  a.href = url;
  a.download = `御${title}書_${worker}.xlsx`;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
};
