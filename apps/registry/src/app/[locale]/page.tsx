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
import {
  NonIdealState,
  NonIdealStateDescription,
  NonIdealStateTitle,
} from "@director.run/design/ui/non-ideal-state";
import { MCPSearchInput } from "components/mcp-server/mcp-search-input";
import { MCPSearchPagination } from "components/mcp-server/mcp-search-pagination";
import { MCPCard } from "components/mcp-server/mcp-server-card";
import { trpc } from "../../trpc/server";

interface HomePageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ query?: string; pageIndex?: string }>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const { query, pageIndex } = await searchParams;

  const data = await trpc.entries.getEntries({
    pageIndex: pageIndex ? parseInt(pageIndex) : 0,
    pageSize: 20,
    searchQuery: query,
  });

  return (
    <View>
      <ViewPanels>
        <ViewPanel>
          <ViewPanelContent>
            <Container className="pt-6 md:pt-12 lg:pt-16" size="lg">
              <Section>
                <SectionHeader>
                  <SectionTitle>Everything</SectionTitle>
                  <SectionDescription>
                    List of all servers in the registry.
                  </SectionDescription>
                </SectionHeader>

                <div className="flex flex-col gap-y-4">
                  <MCPSearchInput />

                  {data.entries.length > 0 && (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {data.entries.map((it) => {
                        return (
                          <MCPCard
                            key={it.id}
                            title={it.title}
                            description={it.description}
                            href={`/${it.name}`}
                            icon={it.icon ?? null}
                            isOfficial={it.isOfficial ?? false}
                          />
                        );
                      })}
                    </div>
                  )}

                  {data.entries.length === 0 && (
                    <NonIdealState>
                      <NonIdealStateTitle>
                        No MCP servers found
                      </NonIdealStateTitle>
                      <NonIdealStateDescription>
                        {query ? (
                          <>
                            We couldn't find any MCP servers matching your
                            search.
                          </>
                        ) : (
                          <>We couldn't find any MCP servers in the registry.</>
                        )}
                      </NonIdealStateDescription>
                    </NonIdealState>
                  )}
                </div>
                <MCPSearchPagination pagination={data.pagination} />
              </Section>
            </Container>
          </ViewPanelContent>
        </ViewPanel>
      </ViewPanels>
    </View>
  );
}
