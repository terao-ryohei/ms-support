import type { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { hc } from "hono/client";
import type { AppType } from "server";

const client = hc<AppType>(import.meta.env.VITE_API_URL);

export const contractLoader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const param = url.searchParams;
  const res = await client.api.contract.$get({
    query: { id: param.get("id") ?? "", type: "partner" },
  });
  return res;
};
