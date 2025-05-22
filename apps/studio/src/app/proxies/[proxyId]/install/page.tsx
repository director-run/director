"use client";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import {
  Section,
  SectionDescription,
  SectionHeader,
  SectionTitle,
} from "@/components/ui/section";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { trpc } from "@/trpc/client";
import { DownloadIcon } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import Markdown from "react-markdown";

export default function InstallPage() {
  const params = useParams<{ proxyId: string }>();

  const [store, registry] = trpc.useQueries((t) => [
    t.store.get({ proxyId: params.proxyId }),
    t.registry.getEntries({ pageIndex: 0, pageSize: 1000 }),
  ]);

  const isLoading = store.isLoading || registry.isLoading;
  const isError = store.isError || registry.isError;

  if (isLoading) {
    // TODO: Add loading state
    return <div>Loading…</div>;
  }

  if (isError || !store.data) {
    // TODO: Add 404
    return <div>Not found</div>;
  }

  const data = store.data;

  return (
    <Container size="lg" className="py-12">
      <div className="flex w-full flex-col gap-y-8">
        <Section>
          <SectionHeader>
            <SectionTitle>Install a server</SectionTitle>
            <SectionDescription>
              Add a new server to{" "}
              <span className="text-foreground">{data.name}</span>.
            </SectionDescription>
          </SectionHeader>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="w-px">
                  <span className="sr-only">Install</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {registry.data?.entries
                .filter((entry) => {
                  const server = data.servers.find((server) => {
                    return server.name === `registry__${entry.name}`;
                  });
                  return !server;
                })
                .sort((a, b) => a.title.localeCompare(b.title))
                .map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="font-medium">{entry.title}</TableCell>
                    <TableCell>
                      <Markdown>{entry.description}</Markdown>
                    </TableCell>
                    <TableCell className="w-px p-1">
                      <Button variant="ghost" size="icon" asChild>
                        <Link
                          href={`/proxies/${params.proxyId}/install/${entry.name}`}
                        >
                          <DownloadIcon className="size-4" />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </Section>
      </div>
    </Container>
  );
}
