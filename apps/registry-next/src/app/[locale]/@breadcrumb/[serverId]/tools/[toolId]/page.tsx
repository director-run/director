import {
  ShellBreadcrumb,
  ShellBreadcrumbAction,
  ShellBreadcrumbList,
  ShellBreadcrumbPage,
  ShellBreadcrumbSeparator,
} from "@director.run/design/components/shell";
import { notFound } from "next/navigation";

import { Link } from "../../../../../../i18n/navigation";
import { trpc } from "../../../../../../trpc/server";

export default async function BreadcrumbPage({
  params,
}: {
  params: Promise<{ serverId: string; toolId: string }>;
}) {
  const { serverId, toolId } = await params;

  const entry = await trpc.entries.getEntryByName({ name: serverId });

  if (!entry) {
    return notFound();
  }

  const tool = entry.tools?.find((tool) => tool.name === toolId);

  if (!tool) {
    return notFound();
  }

  return (
    <ShellBreadcrumb>
      <ShellBreadcrumbList>
        <ShellBreadcrumbAction asChild>
          <Link href="/">Registry</Link>
        </ShellBreadcrumbAction>
        <ShellBreadcrumbSeparator />
        <ShellBreadcrumbAction asChild>
          <Link href={`/${serverId}`}>
            <span>{entry.title}</span>
          </Link>
        </ShellBreadcrumbAction>
        <ShellBreadcrumbSeparator />
        <ShellBreadcrumbAction asChild>
          <Link href={`/${serverId}/tools`}>
            <span>Tools</span>
          </Link>
        </ShellBreadcrumbAction>
        <ShellBreadcrumbSeparator />
        <ShellBreadcrumbPage>{tool.name}</ShellBreadcrumbPage>
      </ShellBreadcrumbList>
    </ShellBreadcrumb>
  );
}
