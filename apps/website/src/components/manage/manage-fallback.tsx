import { DefaultFallback } from "@/lib/no-ssr-suspense";
import {
  DefaultLayout,
  DefaultLayoutContent,
  DefaultLayoutFooter,
} from "../default-layout";
import { Button } from "../ui/button";
import { Loader } from "../ui/loader";
import { SimpleLogo } from "../ui/logo";

export function ManageFallback() {
  return (
    <DefaultLayout>
      <header className="flex justify-between gap-x-0.5">
        <nav className="flex w-full flex-row gap-x-0.5">
          <SimpleLogo className="size-7 hover:text-primary-hover" />
          <Button>
            <Loader />
          </Button>
        </nav>
      </header>
      <DefaultLayoutContent>
        <DefaultFallback />
      </DefaultLayoutContent>
      <DefaultLayoutFooter />
    </DefaultLayout>
  );
}
