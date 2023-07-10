import { Header, Trigger as T } from "@radix-ui/react-accordion";
import { twJoin } from "tailwind-merge";
import { FC, forwardRef, PropsWithChildren, ReactNode } from "react";
import { ChevronDownIcon } from "@radix-ui/react-icons";

type Props = {
  text: string;
  className?: string;
};

export const Trigger = forwardRef<HTMLButtonElement, PropsWithChildren<Props>>(
  function ATrigger({ children, className, ...props }, forwardedRef) {
    return (
      <Header className="flex mx-auto">
        <T
          className={twJoin(
            "text-violet-600 cursor-pointer shadow-mauve6 hover:bg-mauve2 group flex h-[45px] flex-1 items-center justify-between bg-white px-5 text-[15px] leading-none shadow-[0_1px_0] outline-none",
            className
          )}
          ref={forwardedRef}
          {...props}
        >
          {children}
          <ChevronDownIcon
            className="text-sky-500 ease-[cubic-bezier(0.87,_0,_0.13,_1)] transition-transform duration-300 group-data-[state=open]:rotate-180"
            aria-hidden
          />
        </T>
      </Header>
    );
  }
);
