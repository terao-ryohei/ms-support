import type { ReactNode } from "react";

export function Container({
  children,
  title,
}: { children: ReactNode; title: string }) {
  return (
    <div className="mx-auto px-4">
      <h1 className="mb-5 text-left font-bold text-3xl">{title}</h1>
      {children}
    </div>
  );
}
