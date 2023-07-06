import { List } from "@radix-ui/react-tabs";
import { ReactNode, FC } from "react";
import { twMerge } from "tailwind-merge";

type Props = {
  children: ReactNode;
  label: string;
  className?: string;
};

export const TabsList: FC<Props> = ({ children, label, className }) => {
  return (
    <List
      className={twMerge("shrink-0 flex border-b border-slate-400", className)}
      aria-label={label}
    >
      {children}
    </List>
  );
};
