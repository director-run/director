import { Container } from "@director.run/design/components/container";
import {
  Section,
  SectionDescription,
  SectionHeader,
  SectionTitle,
} from "@director.run/design/components/section";
import {
  View,
  ViewHeader,
  ViewPanel,
  ViewPanelContent,
  ViewPanels,
} from "@director.run/design/components/view";
import { Card } from "@director.run/design/ui/card";
import { Markdown, SimpleMarkdown } from "@director.run/design/ui/markdown";
import {
  NonIdealState,
  NonIdealStateDescription,
  NonIdealStateTitle,
} from "@director.run/design/ui/non-ideal-state";
import { notFound } from "next/navigation";

import { MCPServerNavigation } from "components/mcp-server/mcp-server-navigation";
import { trpc } from "../../../../trpc/server";

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
    <View>
      <ViewHeader>
        <MCPServerNavigation server={entry} />
      </ViewHeader>

      <ViewPanels>
        <ViewPanel>
          <ViewPanelContent>
            <Container className="pt-16" size="lg">
              <Section>
                <SectionHeader>
                  <SectionTitle>README.md</SectionTitle>
                  <SectionDescription className="prose">
                    <a
                      href={entry.homepage}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Source
                    </a>
                  </SectionDescription>
                </SectionHeader>

                {entry.readme ? (
                  <Card variant="subtle">
                    <Markdown className="prose-sm">{entry.readme}</Markdown>
                  </Card>
                ) : (
                  <NonIdealState>
                    <NonIdealStateTitle>No README found</NonIdealStateTitle>
                    <NonIdealStateDescription className="prose">
                      <SimpleMarkdown>{`We don't have a README available for this server. However, you can try looking [here](${entry.homepage}).`}</SimpleMarkdown>
                    </NonIdealStateDescription>
                  </NonIdealState>
                )}
              </Section>
            </Container>
          </ViewPanelContent>
        </ViewPanel>
      </ViewPanels>
    </View>
  );
}
