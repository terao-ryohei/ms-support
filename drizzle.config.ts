import type { Config } from "drizzle-kit";
export default {
  schema: ["./drizzle/schema.ts"], // スキーマ定義ファイル
  out: "./drizzle", // マイグレーションファイルの出力ディレクトリ
  dialect: "sqlite", // SQLiteを使用
} satisfies Config;
