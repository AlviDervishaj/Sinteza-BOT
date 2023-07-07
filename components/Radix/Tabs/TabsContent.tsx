import { FC, ReactNode } from "react";
import { Content } from "@radix-ui/react-tabs";

type Props = {
  children: ReactNode;
  value: string;
  className?: string;
};

export const TabsContent: FC<Props> = ({ children, value, className }) => {
  return (
    <Content value={value} className={className}>
      {children}
    </Content>
  );
};
