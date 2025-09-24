export const SplitView = ({ children }: React.ComponentProps<"div">) => {
  return <div className="flex flex-row gap-x-8">{children}</div>;
};

export const SplitViewMain = ({ children }: React.ComponentProps<"div">) => {
  return (
    <div className="flex min-w-0 grow flex-col gap-y-12 lg:gap-y-16">
      {children}
    </div>
  );
};

export const SplitViewSide = ({ children }: React.ComponentProps<"div">) => {
  return (
    <div className="hidden w-xs shrink-0 flex-col lg:flex">
      <div className="sticky top-0 flex flex-col gap-y-8">{children}</div>
    </div>
  );
};
