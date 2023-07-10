import { AccordionContent } from "@radix-ui/react-accordion";
import { PropsWithChildren, ReactNode, forwardRef } from "react";
import { twJoin } from "tailwind-merge";

type Props = {
  children: ReactNode;
  className?: string;
};

export const Content = forwardRef<HTMLDivElement, PropsWithChildren<Props>>(
  function AContent({ children, className, ...props }, forwardedRef) {
    return (
      <AccordionContent
        {...props}
        ref={forwardedRef}
        className={twJoin(
          "bg-slate-100 p-4 data-[state=open]:animate-slideDown data-[state=closed]:animate-slideUp",
          className
        )}
      >
        <div className="py-[15px] px-5">{children}</div>
      </AccordionContent>
    );
  }
);
