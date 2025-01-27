import type { DetailedHTMLProps, ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "~/utils/cn";

export function Button({
  props,
  className,
  children,
  type = "primary",
}: {
  props?: DetailedHTMLProps<
    ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  >;
  children: ReactNode;
  className?: string;
  type?: "primary" | "secondary";
}) {
  return (
    <button
      className={cn(
        "cursor-pointer rounded-md px-4 py-2",
        type === "primary" &&
          "bg-secondary font-bold text-secondary-foreground shadow-md hover:bg-secondary-hover",
        type === "secondary" &&
          "border border-gray-500 bg-white text-gray-500 hover:bg-gray-200",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
