import {
  Action,
  Cancel,
  Content,
  Description,
  Root,
  Title,
} from "@radix-ui/react-alert-dialog";
import { Link, useLocation } from "@remix-run/react";
import type { ReactNode } from "react";
import { ToastProvider } from "~/components/toast/toastProvider";

type NavItemProps = {
  href: string;
  label: string;
};

export const NavItem = ({ href, label }: NavItemProps) => {
  return (
    <li>
      <Link to={href}>{label}</Link>
    </li>
  );
};

export const Layout = ({ children }: { children: ReactNode }) => {
  const { pathname } = useLocation();

  return (
    <div className="flex h-[100vh] flex-col">
      <header className="fixed flex w-full bg-secondary-hover p-4">
        <ul className="flex gap-4 font-bold text-white">
          <li className={pathname === "/" ? "text-accent" : ""}>
            <NavItem href="/" label="Home" />
          </li>
          <li className={pathname === "/contract/data" ? "text-accent" : ""}>
            <NavItem href="/contract/data" label="契約者一覧" />
          </li>
          <li className={pathname === "/quote/data" ? "text-accent" : ""}>
            <NavItem href="/quote/data" label="見積書作成装置" />
          </li>
          <li className={pathname === "/claim/data" ? "text-accent" : ""}>
            <NavItem href="/claim/data" label="請求書作成装置" />
          </li>
          <li className={pathname === "/order/data" ? "text-accent" : ""}>
            <NavItem href="/order/data" label="注文書作成装置" />
          </li>
        </ul>
      </header>
      <ToastProvider>
        <main className="relative mt-14 flex-grow overflow-y-auto p-4">
          <Root>
            <section className="h-full">{children}</section>
          </Root>
        </main>
      </ToastProvider>
    </div>
  );
};
