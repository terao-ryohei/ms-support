import { Provider, Viewport } from "@radix-ui/react-toast";
import {
  type ReactNode,
  useState,
  useCallback,
  createContext,
  useContext,
} from "react";
import { Toast, type ToastItem } from "./toast";

const genRandomId = () => Math.random().toString(32).substring(2);

type OpenToastParams = Omit<ToastItem, "id" | "isOpen">;

const OpenToastContext = createContext<(params: OpenToastParams) => void>(
  () => null,
);

export function useToast() {
  return useContext(OpenToastContext);
}

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const openToast = useCallback((params: OpenToastParams) => {
    const id = genRandomId();
    setToasts((prev) => [...prev, { id, isOpen: true, ...params }]);
  }, []);

  const closeToast = useCallback((id: string) => {
    setToasts((prev) =>
      prev.map((value) =>
        value.id === id ? { ...value, isOpen: false } : value,
      ),
    );

    setTimeout(() => {
      setToasts((prev) => prev.filter((value) => value.id !== id));
    }, 200);
  }, []);

  return (
    <OpenToastContext.Provider value={openToast}>
      <Provider duration={5000}>
        {children}
        {toasts.map((value) => (
          <Toast key={value.id} value={value} onClose={closeToast} />
        ))}
        <Viewport className="absolute right-[20px] bottom-[20px]" />
      </Provider>
    </OpenToastContext.Provider>
  );
};
