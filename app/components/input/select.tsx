export const Select = <RegisterType,>({
  register,
  data,
  disable = false,
}: {
  register: RegisterType;
  data: { id: number | string; value: string | number; view?: string }[];
  disable?: boolean;
}) => (
  <select
    {...register}
    className="mb-2 w-full rounded-md border border-gray-300 p-2 text-sm"
    disabled={disable}
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
