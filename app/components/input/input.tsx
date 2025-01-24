import type { DetailedHTMLProps, InputHTMLAttributes } from "react";
import { cn } from "~/utils/cn";

export function Input<RegisterType>({
  register,
  props,
  classname,
}: {
  register: RegisterType;
  props: DetailedHTMLProps<
    InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
  >;
  classname?: string;
}) {
  return (
    <input
      {...register}
      {...props}
      className={cn(
        "w-full rounded-md border border-gray-300 p-2 text-sm",
        (props.inputMode === "email" ||
          props.inputMode === "tel" ||
          props.inputMode === "numeric" ||
          props.inputMode === "decimal" ||
          props.type === "date" ||
          props.type === "number") &&
          "text-right",
        classname,
      )}
    />
  );
}
