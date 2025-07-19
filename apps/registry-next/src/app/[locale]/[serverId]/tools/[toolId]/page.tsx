import { Container } from "@director.run/design/components/container";
import {
  Section,
  SectionDescription,
  SectionHeader,
  SectionTitle,
} from "@director.run/design/components/section";
import {
  View,
  ViewPanel,
  ViewPanelContent,
  ViewPanels,
} from "@director.run/design/components/view";
import { Badge, BadgeLabel } from "@director.run/design/ui/badge";
import { Card } from "@director.run/design/ui/card";
import { Markdown } from "@director.run/design/ui/markdown";
import { JSONSchema, JsonSchema } from "components/mcp-tool/mcp-tool-schema";
import Link from "next/link";
import { notFound } from "next/navigation";
import { trpc } from "../../../../../trpc/server";

interface ServerPageProps {
  params: Promise<{
    serverId: string;
    toolId: string;
  }>;
}

export default async function ServerPage({ params }: ServerPageProps) {
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
    <View>
      <ViewPanels>
        <ViewPanel>
          <ViewPanelContent>
            <Container className="pt-16" size="lg">
              <Section>
                <SectionHeader>
                  <Badge className="self-start" variant="secondary">
                    <BadgeLabel uppercase>Tool</BadgeLabel>
                  </Badge>
                  <SectionTitle className="mt-2">{tool.name}</SectionTitle>
                  <SectionDescription className="prose">
                    From{" "}
                    <Link href={`/${serverId}`}>
                      <span>{entry.title}</span>
                    </Link>
                  </SectionDescription>
                </SectionHeader>
              </Section>

              <Section id="description" className="gap-y-4 sm:gap-y-6">
                <SectionHeader>
                  <SectionTitle className="text-xl sm:text-xl md:text-2xl">
                    Description
                  </SectionTitle>
                </SectionHeader>
                <Card variant="subtle" spacing="sm">
                  <Markdown>{tool.description}</Markdown>
                </Card>
              </Section>

              <Section id="input-schema" className="gap-y-4 sm:gap-y-6">
                <SectionHeader>
                  <SectionTitle className="text-xl sm:text-xl md:text-2xl">
                    Input schema
                  </SectionTitle>
                </SectionHeader>

                <JSONSchema schema={tool.inputSchema as JsonSchema} />
              </Section>
            </Container>
          </ViewPanelContent>
        </ViewPanel>
      </ViewPanels>
    </View>
  );
}
