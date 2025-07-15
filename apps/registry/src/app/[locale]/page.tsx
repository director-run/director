import { Container } from "@director.run/design/components/container";
import { Card } from "@director.run/design/ui/card";
import Image from "next/image";

import { Link } from "../../i18n/navigation";
import { trpc } from "../../trpc/server";

export default async function HomePage() {
  const { entries } = await trpc.entries.getEntries({
    pageIndex: 0,
    pageSize: 100,
  });

  return (
    <Container>
      {entries.map((it) => {
        return (
          <Card key={it.id} interactive asChild>
            <Link href={`/${it.name}`}>
              <h2>{it.name}</h2>
              {it.icon && (
                <Image src={it.icon} alt={it.title} width={100} height={100} />
              )}
            </Link>
          </Card>
        );
      })}
    </Container>
  );
}
