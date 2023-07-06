import { Root } from "@radix-ui/react-tabs";
import { FC, ReactNode } from "react";
import { twMerge } from "tailwind-merge";

type Props = {
  children: ReactNode;
  value: string;
  className?: string;
};

export const TabsRoot: FC<Props> = ({ children, value, className }) => {
  return (
    <Root
      className={twMerge(
        "flex flex-col max-w-2xl shadow-[0_2px_10px] shadow-blackA4",
        className
      )}
      defaultValue={value}
    >
      {children}
    </Root>
  );
};
