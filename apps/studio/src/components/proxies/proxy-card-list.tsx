"use client";

import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { cn } from "@/lib/cn";
import { trpc } from "@/trpc/client";

interface ProxyCardProps {
  id: string;
  name: string;
  description?: string;
  className?: string;
}

function ProxyCard({
  id,
  name,
  description,
  className,
  ...props
}: ProxyCardProps) {
  return (
    <Link
      className={cn(
        "group flex gap-x-10 rounded-2xl bg-element p-4 transition-colors duration-200 ease-in-out hover:bg-element-hover",
        className,
      )}
      href={`/proxies/${id}`}
      {...props}
    >
      <div className="flex grow flex-col gap-y-1">
        <h3 className="text-lg leading-6">{name}</h3>
        <p
          className={cn(
            "line-clamp-2 text-foreground-subtle text-sm",
            description ? "opacity-100" : "opacity-60",
          )}
        >
          {description ?? "No description"}
        </p>
      </div>
      <ArrowRightIcon className="size-6 shrink-0 stroke-[1.5] text-foreground-subtle opacity-0 transition-opacity duration-200 ease-in-out group-hover:opacity-100" />
    </Link>
  );
}

function ProxyCardSkeleton() {
  return (
    <div className="flex animate-pulse gap-x-10 rounded-2xl bg-element p-4">
      <div className="flex grow flex-col gap-y-1">
        <div className="h-6 w-48 rounded-full bg-element-hover" />
        <div className="h-5 w-64 rounded-full bg-element-hover" />
      </div>
    </div>
  );
}

export function ProxyCardList() {
  const router = useRouter();
  const { data, isLoading } = trpc.store.getAll.useQuery();

  const hasNoProxies = !isLoading && data?.length === 0;

  useEffect(() => {
    if (hasNoProxies) {
      router.push("/proxies/new");
    }
  }, [hasNoProxies, router]);

  if (isLoading || !data || hasNoProxies) {
    return (
      <div className="flex flex-col gap-y-2">
        <ProxyCardSkeleton />
        <ProxyCardSkeleton />
        <ProxyCardSkeleton />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-y-2">
      {data.map((proxy) => (
        <ProxyCard key={proxy.id} {...proxy} />
      ))}
    </div>
  );
}
