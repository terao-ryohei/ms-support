import type { DetailedHTMLProps, SelectHTMLAttributes } from "react";

export function Select<RegisterType>({
  register,
  data,
  props,
}: {
  register: RegisterType;
  data: { id: number | string; value: string | number; view?: string }[];
  props: DetailedHTMLProps<
    SelectHTMLAttributes<HTMLSelectElement>,
    HTMLSelectElement
  >;
}) {
  return (
    <select
      {...register}
      {...props}
      className="mb-2 w-full rounded-md border border-gray-300 p-2 text-sm"
    >
      <option value={0} disabled>
        選択してください
      </option>
      {data.map(({ value, id, view }) => (
        <option key={id} value={id}>
          {view ?? value}
        </option>
      ))}
    </select>
  );
}
