import type { HTMLInputTypeAttribute } from "react";

export const Input = <RegisterType,>({
  register,
  type = "text",
  inputMode,
  placeholder,
  disable = false,
}: {
  register: RegisterType;
  type?: HTMLInputTypeAttribute;
  inputMode?:
    | "email"
    | "search"
    | "tel"
    | "text"
    | "url"
    | "none"
    | "numeric"
    | "decimal";
  placeholder?: string;
  disable?: boolean;
}) => (
  <input
    {...register}
    className={`w-full rounded-md border border-gray-300 p-2 text-sm ${(inputMode === "email" || inputMode === "tel" || inputMode === "numeric" || inputMode === "decimal" || type === "date" || type === "number") && "text-right"}`}
    type={type}
    inputMode={inputMode}
    placeholder={placeholder}
    disabled={disable}
  />
);
