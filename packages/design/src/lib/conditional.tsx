import type { PropsWithChildren, ReactNode } from "react";

type ConditionalProps = PropsWithChildren<{
  condition: boolean;
  wrap: (children: ReactNode) => ReactNode;
}>;

export function Conditional({ children, condition, wrap }: ConditionalProps) {
  return condition ? wrap(children) : children;
}
