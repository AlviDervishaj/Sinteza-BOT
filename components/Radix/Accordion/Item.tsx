import { forwardRef, PropsWithChildren, ReactNode } from "react";
import { Item as I } from "@radix-ui/react-accordion";
import { twJoin } from "tailwind-merge";

type Props = {
  value: string;
  children: ReactNode;
  className?: string;
};

export const Item = forwardRef<HTMLDivElement, PropsWithChildren<Props>>(
  function AItem(
    { children, value, className, ...props }: Props,
    forwardedRef
  ) {
    return (
      <I
        value={value}
        ref={forwardedRef}
        className={twJoin(
          "focus-within:shadow-mauve12 mt-px overflow-hidden first:mt-0 first:rounded-t last:rounded-b focus-within:relative focus-within:z-10 focus-within:shadow-[0_0_0_2px]",
          className
        )}
        {...props}
      >
        {children}
      </I>
    );
  }
);
