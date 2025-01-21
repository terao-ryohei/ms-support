import { Description, Root, Title } from "@radix-ui/react-toast";
import { AlertCircle } from "lucide-react";

export type ToastItem = {
  id: string;
  isOpen: boolean;
  type: "success" | "failed";
  description?: string;
  duration?: number;
  title: string;
};

export const Toast = ({
  value,
  onClose,
}: {
  value: ToastItem;
  onClose: (id: string) => void;
}) => {
  return (
    <Root
      open={value.isOpen}
      onOpenChange={(isOpen) => !isOpen && onClose(value.id)}
      duration={value.duration}
      className="flex items-center gap-2 rounded-md border-b-4 border-b-lime-500 border-b-solid bg-white px-4 py-2 [box-shadow:_2px_2px_4px]"
    >
      <AlertCircle />
      <div>
        <Title className="text-xl">{value.title}</Title>
        {value.description && <Description>{value.description}</Description>}
      </div>
    </Root>
  );
};
