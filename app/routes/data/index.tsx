import { hc } from "hono/client";
import type { AppType } from "server";
import { EditableTable } from "~/components/table/editableTable";
import { translatedArray, useHooks } from "./useHooks";

const client = hc<AppType>(import.meta.env.VITE_API_URL);

export const loader = async () => {
  const salesData = (await (await client.api.sales.all.$get()).json()).map(
    (data) => ({ ...data, isDisable: !data.isDisable }),
  );
  const companiesData = (
    await (await client.api.companies.all.$get()).json()
  ).map((data) => ({ ...data, isDisable: !data.isDisable }));
  const workersData = (await (await client.api.workers.all.$get()).json()).map(
    (data) => ({ ...data, isDisable: !data.isDisable }),
  );
  return { salesData, companiesData, workersData };
};

export default function Index() {
  const { table, columns, columnOrder } = useHooks();

  return (
    <div className="flex h-full gap-5">
      <div className="flex flex-col items-center gap-4">
        営業
        <EditableTable
          table={table("sales")}
          columns={columns}
          headerList={translatedArray}
          columnOrder={columnOrder}
          isHeaderView={false}
        />
      </div>
      <div className="flex flex-col items-center gap-4">
        会社
        <EditableTable
          table={table("companies")}
          columns={columns}
          headerList={translatedArray}
          columnOrder={columnOrder}
          isHeaderView={false}
        />
      </div>
      <div className="flex flex-col items-center gap-4">
        作業者
        <EditableTable
          table={table("workers")}
          columns={columns}
          headerList={translatedArray}
          columnOrder={columnOrder}
          isHeaderView={false}
        />
      </div>
    </div>
  );
}
