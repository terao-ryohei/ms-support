import { Link } from "@remix-run/react";

export default function Index() {
  return (
    <div>
      <h1 className="mb-20 ml-10 text-left font-bold font-mono text-5xl">
        MS部契約管理システム
      </h1>
      <ul className="mx-auto w-1/2 rounded-md border-2 border-teal-500 border-solid p-0">
        <li className="border-b-[1px] border-b-teal-600 border-solid text-xl even:bg-muted/50">
          <Link className="block h-full w-full px-10 py-4" to="/contract">
            契約者一覧
          </Link>
        </li>
        <li className="border-b-[1px] border-b-teal-600 border-solid text-xl even:bg-muted/50">
          <Link className="block h-full w-full px-10 py-4" to="/quote/data">
            見積書作成装置
          </Link>
        </li>
        <li className="border-b-[1px] border-b-teal-600 border-solid text-xl even:bg-muted/50">
          <Link className="block h-full w-full px-10 py-4" to="/claim/data">
            請求書作成装置
          </Link>
        </li>
        <li className=" text-xl even:bg-muted/50">
          <Link className="block h-full w-full px-10 py-4" to="/order/data">
            注文書作成装置
          </Link>
        </li>
      </ul>
    </div>
  );
}
