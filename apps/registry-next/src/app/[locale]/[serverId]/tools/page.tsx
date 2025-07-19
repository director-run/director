import { Container } from "@director.run/design/components/container";
import {
  Section,
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
import { SimpleMarkdown } from "@director.run/design/ui/markdown";
import {
  NonIdealState,
  NonIdealStateDescription,
  NonIdealStateTitle,
} from "@director.run/design/ui/non-ideal-state";
import { MCPServerNavigation } from "components/mcp-server/mcp-server-navigation";
import { MCPServerToolCard } from "components/mcp-server/mcp-server-tool-card";
import { notFound } from "next/navigation";
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

  const tools = entry.tools ?? [];
  const hasTools = tools.length > 0;

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
                  <SectionTitle>Tools</SectionTitle>
                </SectionHeader>
                {hasTools ? (
                  <div className="flex flex-col gap-y-2">
                    {tools.map((tool) => (
                      <MCPServerToolCard
                        key={tool.name}
                        name={tool.name}
                        description={tool.description}
                        href={`/${serverId}/tools/${tool.name}`}
                        server={serverId}
                      />
                    ))}
                  </div>
                ) : (
                  <NonIdealState>
                    <NonIdealStateTitle>No tools found</NonIdealStateTitle>
                    <NonIdealStateDescription>
                      We don't have any tool information for this server. Once
                      this server is running, you'll be able to see the tools
                      available.
                    </NonIdealStateDescription>
                    <NonIdealStateDescription className="prose">
                      <SimpleMarkdown>
                        {`You can also try the [README.md](/${serverId}/readme).`}
                      </SimpleMarkdown>
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
