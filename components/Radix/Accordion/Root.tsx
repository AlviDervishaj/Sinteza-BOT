import React, { FC, ReactNode } from "react";
import { twJoin } from "tailwind-merge";
import { Root as R } from "@radix-ui/react-accordion";

type Props = {
  children: ReactNode[];
  className?: string;
};

export const Root: FC<Props> = ({ children, className }) => (
  <R
    className={twJoin(
      "w-full rounded-md shadow-[0_2px_10px] shadow-black/5",
      className
    )}
    type="single"
    collapsible
  >
    {children}
  </R>
);
