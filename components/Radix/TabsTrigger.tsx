import { Trigger } from "@radix-ui/react-tabs";
import { FC, ReactNode } from "react";
import { twMerge } from "tailwind-merge";

type Props = {
  children: ReactNode;
  value: string;
  className?: string;
};

export const TabsTrigger: FC<Props> = ({ children, value, className }) => {
  return (
    <Trigger
      value={value}
      className={twMerge(
        "bg-white px-5 h-[45px] flex-1 flex items-center justify-center text-[15px] leading-none text-sky-600 select-none first:rounded-tl-md last:rounded-tr-md  data-[state=active]:text-sky-600 data-[state=active]:shadow-[inset_0_-1px_0_0,0_1px_0_0] data-[state=active]:shadow-current data-[state=active]:focus:relative data-[state=active]:focus:shadow-[0_0_0_2px] data-[state=active]:focus:shadow-black outline-none cursor-pointer",
        className
      )}
    >
      <p className="text-xl tracking-wide">{children}</p>
    </Trigger>
  );
};
