import type { DetailedHTMLProps, ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "~/utils/cn";

export function Button({
  props,
  className,
  children,
}: {
  props?: DetailedHTMLProps<
    ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  >;
  children: ReactNode;
  className?: string;
}) {
  return (
    <button
      className={cn(
        "mt-5 h-14 rounded-md bg-secondary px-4 py-2 font-bold text-secondary-foreground shadow-md hover:bg-secondary-hover",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
