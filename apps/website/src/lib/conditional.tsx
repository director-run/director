import * as React from 'react';

type ConditionalProps = React.PropsWithChildren<{
  condition: boolean;
  wrap: (children: React.ReactNode) => React.ReactNode;
}>;

export function Conditional({ children, condition, wrap }: ConditionalProps) {
  return condition ? wrap(children) : children;
}
