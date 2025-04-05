import { Outlet } from "react-router";
import { ScrollArea } from "../ui/scroll-area";

export function SingleLayout() {
  return (
    <ScrollArea className="h-svh w-full">
      <div className="flex min-h-svh items-center justify-center py-14">
        <Outlet />
      </div>
    </ScrollArea>
  );
}
