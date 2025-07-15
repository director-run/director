import { Container } from "@director.run/design/components/container";
import { Card } from "@director.run/design/ui/card";
import Image from "next/image";
import { notFound } from "next/navigation";

import { trpc } from "../../../trpc/server";

interface ServerPageProps {
  params: Promise<{
    serverId: string;
  }>;
}

export default async function ServerPage({ params }: ServerPageProps) {
  const { serverId } = await params;

  const entry = await trpc.entries.getEntryByName({ name: serverId });

  if (!entry) {
    return notFound();
  }

  return (
    <Container>
      <Card>
        <h2>{entry?.name}</h2>
        {entry?.icon && (
          <Image src={entry.icon} alt={entry.title} width={100} height={100} />
        )}
      </Card>
    </Container>
  );
}
