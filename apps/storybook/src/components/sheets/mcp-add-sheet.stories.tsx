import { McpAddSheet } from "@director.run/studio/components/mcp-servers/mcp-add-sheet.tsx";
import type { McpAddFormData } from "@director.run/studio/components/mcp-servers/mcp-add-sheet.tsx";
import { Button } from "@director.run/studio/components/ui/button.tsx";
import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";

const meta = {
  title: "components/sheets/mcp-add-sheet",
  component: McpAddSheet,
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof McpAddSheet>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    onSubmit: (_data: McpAddFormData) => Promise.resolve(),
  },
  render: () => {
    const [open, setOpen] = useState(true);

    const proxies = [
      { id: "proxy-1", name: "Local Proxy" },
      { id: "proxy-2", name: "Remote Proxy" },
    ];

    const handleSubmit = (data: McpAddFormData) => {
      console.log("Add to proxy:", data.proxyId);
      console.log("Server:", JSON.stringify(data.server, null, 2));
      console.log("Environment variables:", JSON.stringify(data._env, null, 2));
      console.log("Headers:", JSON.stringify(data._headers, null, 2));
      return Promise.resolve();
    };

    return (
      <div className="min-h-screen bg-surface p-8">
        <div className="mb-4 flex items-center gap-2">
          <Button onClick={() => setOpen((v) => !v)} variant="secondary">
            {open ? "Close Sheet" : "Open Sheet"}
          </Button>
        </div>
        <McpAddSheet
          open={open}
          onOpenChange={setOpen}
          proxies={proxies}
          onSubmit={handleSubmit}
          isSubmitting={false}
        />
      </div>
    );
  },
};
