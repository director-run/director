import {
  ShellBreadcrumb,
  ShellBreadcrumbAction,
  ShellBreadcrumbList,
  ShellBreadcrumbPage,
  ShellBreadcrumbSeparator,
} from "@director.run/design/components/shell";
import { notFound } from "next/navigation";

import { Link } from "../../../../../i18n/navigation";
import { trpc } from "../../../../../trpc/server";

export default async function BreadcrumbPage({
  params,
}: {
  params: Promise<{ serverId: string }>;
}) {
  const { serverId } = await params;

  const entry = await trpc.entries.getEntryByName({ name: serverId });

  if (!entry) {
    return notFound();
  }

  return (
    <ShellBreadcrumb>
      <ShellBreadcrumbList>
        <ShellBreadcrumbAction asChild>
          <Link href="/">Registry</Link>
        </ShellBreadcrumbAction>
        <ShellBreadcrumbSeparator />
        <ShellBreadcrumbPage>{entry.title}</ShellBreadcrumbPage>
      </ShellBreadcrumbList>
    </ShellBreadcrumb>
  );
}
