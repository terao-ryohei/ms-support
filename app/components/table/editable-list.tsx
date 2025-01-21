import { Separator } from "@radix-ui/react-dropdown-menu";
import {
  Content,
  Icon,
  Item,
  ItemIndicator,
  ItemText,
  ScrollDownButton,
  ScrollUpButton,
  Select,
  Trigger,
  Value,
  Viewport,
} from "@radix-ui/react-select";
import { CheckIcon, ChevronDownIcon, ChevronUpIcon, X } from "lucide-react";
import { useState } from "react";

export const EditableList = ({
  data,
  value,
  onChange,
  onAdd,
  onDelete,
}: {
  data: { id: number; name: string }[];
  value: number;
  onChange: (id: string) => void;
  onAdd: (id: string) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}) => {
  const [addData, setAddData] = useState("");

  return (
    <Select defaultValue={String(value)} onValueChange={onChange}>
      <Trigger className="flex gap-2 rounded-md bg-[#fcfcfc] px-2 py-1">
        <Value />
        <Icon className="SelectIcon">
          <ChevronDownIcon />
        </Icon>
      </Trigger>
      <Content className="overflow-hidden rounded-md bg-slate-200">
        <ScrollUpButton className="flex h-[25px] items-center justify-center bg-white text-lime-500">
          <ChevronUpIcon />
        </ScrollUpButton>
        <Viewport className="p-2">
          {data.map(({ name, id }) => (
            <div key={id} className="flex items-center gap-2">
              <Item
                value={String(id)}
                className="flex flex-grow cursor-pointer gap-2 rounded-sm px-4 py-2 pl-2 hover:bg-slate-300"
              >
                <ItemIndicator className="text-sm">
                  <CheckIcon size={20} />
                </ItemIndicator>
                <ItemText>{name}</ItemText>
              </Item>
              <span className="flex items-center justify-center rounded-md hover:bg-slate-50">
                <button
                  type="button"
                  onClick={() => {
                    onDelete(id);
                  }}
                >
                  <X size={20} />
                </button>
              </span>
            </div>
          ))}
          <Separator className="my-1 h-[1px] bg-slate-600" />
          <div className="flex gap-2">
            <input
              placeholder="新規追加"
              className="rounded-sm px-2 py-1"
              onChange={(e) => setAddData(e.target.value)}
            />
            <button
              type="button"
              onClick={() => {
                onAdd(addData);
              }}
              className="rounded-md bg-teal-500 px-2 py-1"
            >
              追加
            </button>
          </div>
        </Viewport>
        <ScrollDownButton className="flex h-[25px] items-center justify-center bg-white text-lime-500">
          <ChevronDownIcon />
        </ScrollDownButton>
      </Content>
    </Select>
  );
};
