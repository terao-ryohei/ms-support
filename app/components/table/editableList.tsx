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
import { Link } from "@remix-run/react";
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import { useRef } from "react";
import { cn } from "~/utils/cn";
import { Button } from "../input/button";

export function EditableList({
  data,
  value,
  onChange,
  onAdd,
  className,
  name,
}: {
  data: { id: number; name: string }[];
  value: number;
  onChange: (id: string) => void;
  onAdd: (id: string) => Promise<void>;
  className?: string;
  name?: string;
}) {
  const addData = useRef("");

  return (
    <Select
      name={name}
      defaultValue={String(value)}
      required
      onValueChange={onChange}
    >
      <Trigger
        className={cn(
          "flex items-center gap-2 rounded-md bg-[#fcfcfc] px-2 py-1",
          className,
        )}
      >
        <div className="h-full w-full content-center">
          <Value />
        </div>
        <Icon className="SelectIcon">
          <ChevronDownIcon />
        </Icon>
      </Trigger>
      <Content className="z-[100] overflow-hidden rounded-md bg-slate-200">
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
            </div>
          ))}
          <Separator className="my-1 h-[1px] bg-slate-600" />
          <div className="my-4 flex gap-2">
            <input
              placeholder="新規追加"
              className="rounded-sm px-2 py-1"
              onChange={(e) => {
                addData.current = e.target.value;
              }}
            />
            <button
              type="button"
              onClick={() => {
                onAdd(addData.current);
              }}
              className="rounded-md bg-secondary px-2 py-1 text-white hover:bg-secondary-hover"
            >
              追加
            </button>
          </div>
          <div className="flex justify-center gap-2">
            <Link to="/data">
              <Button>表示データの管理</Button>
            </Link>
          </div>
        </Viewport>
        <ScrollDownButton className="flex h-[25px] items-center justify-center bg-white text-lime-500">
          <ChevronDownIcon />
        </ScrollDownButton>
      </Content>
    </Select>
  );
}
