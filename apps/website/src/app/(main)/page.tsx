import { DefaultLayoutContent } from "@/components/layouts/default-layout";
import Image from "next/image";

import bgImage from "@/../public/images/example-1.jpg";
import { cn } from "@director/ui/lib/cn";

export default async function HomePage() {
  return (
    <DefaultLayoutContent>
      <div className="flex max-w-xl flex-col gap-5">
        <div className="flex flex-col gap-1">
          <h1 className="font-medium font-mono">DIRECTOR.run</h1>
          <p className="font-extralight font-mono">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Perferendis
            accusantium ducimus temporibus laborum. Repellat laboriosam mollitia
            consequatur, cum reprehenderit voluptatum vel pariatur itaque,
            maxime voluptas blanditiis, id quis recusandae excepturi!
          </p>
        </div>
      </div>

      <div className="relative isolate flex w-full select-none items-center justify-center overflow-hidden rounded-3xl p-8 md:aspect-[6/4]">
        <Image
          src={bgImage}
          alt="bg"
          className="-inset-0 absolute z-10 select-none saturate-50"
          fill
        />

        <div
          className={cn(
            "relative z-20 flex aspect-square w-full flex-col overflow-hidden rounded-xl bg-gray-1 shadow-2xl sm:aspect-[6/4] md:max-w-2xl lg:max-w-3xl",
          )}
        >
          <div
            className="pointer-events-none absolute top-3 left-3 flex flex-row gap-x-1"
            aria-hidden
          >
            <span className="size-3 rounded-full border border-gray-5 bg-gray-2" />
            <span className="size-3 rounded-full border border-gray-5 bg-gray-2" />
            <span className="size-3 rounded-full border border-gray-5 bg-gray-2" />
          </div>
          <div className="flex grow items-center justify-center">
            <span className="text-muted-foreground">This is a placeholder</span>
          </div>
        </div>
      </div>
    </DefaultLayoutContent>
  );
}
