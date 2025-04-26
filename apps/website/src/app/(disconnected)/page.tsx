import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Home() {
  return (
    <>
      <div className="mx-auto flex min-h-[80dvh] max-w-md flex-col items-center justify-center gap-y-8 py-16 text-center">
        <div className="flex flex-col gap-y-4">
          <h1 className="text-balance font-normal text-4xl">
            Get up and running with MCP servers in minutes.
          </h1>
          <p className="text-pretty text-foreground-subtle text-xl">
            Install, configure, and manage all your local MCP needs from a
            single command line tool.
          </p>
        </div>

        <Tabs defaultValue="npm">
          <TabsList>
            <TabsTrigger value="npm">npm</TabsTrigger>
            <TabsTrigger value="pnpm">pnpm</TabsTrigger>
            <TabsTrigger value="yarn">yarn</TabsTrigger>
            <TabsTrigger value="bun">bun</TabsTrigger>
          </TabsList>

          <TabsContent value="pnpm">
            <pre>
              <code>pnpm add -g @director.run/cli</code>
            </pre>
          </TabsContent>
          <TabsContent value="npm">
            <pre>
              <code>npm install -g @director.run/cli</code>
            </pre>
          </TabsContent>
          <TabsContent value="yarn">
            <pre>
              <code>yarn global add @director.run/cli</code>
            </pre>
          </TabsContent>
          <TabsContent value="bun">
            <pre>
              <code>bun add -g @director.run/cli</code>
            </pre>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
