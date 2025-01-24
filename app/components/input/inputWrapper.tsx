import type { DetailedHTMLProps, ReactNode, HTMLAttributes } from "react";
import { cn } from "~/utils/cn";

export function InputWrapper({
  props,
  className,
  children,
  input,
}: {
  props?: DetailedHTMLProps<HTMLAttributes<HTMLSpanElement>, HTMLSpanElement>;
  children: ReactNode;
  input: ReactNode;
  className?: string;
}) {
  return (
    <div className="flex flex-col">
      <span className={cn("mt-2 mb-2 font-bold text-sm", className)} {...props}>
        {children}
      </span>
      {input}
    </div>
  );
}
