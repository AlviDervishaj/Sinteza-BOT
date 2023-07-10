import { FC, ReactNode } from "react";
import { Item } from "./Item";
import { Trigger } from "./Trigger";
import { Content } from "./Content";

type Props = {
  title: string;
  value: string;
  children: ReactNode;
};

export const Accordion: FC<Props> = ({ title, value, children }) => {
  return (
    <Item value={value} className="w-1/3 mx-auto">
      <Trigger text={title}>{title}</Trigger>
      <Content>{children}</Content>
    </Item>
  );
};
