import { WorkspaceTargetAddSheet } from "@director.run/studio/components/mcp-servers/mcp-add-sheet.tsx";
import type { WorkspaceTargetFormData } from "@director.run/studio/components/mcp-servers/mcp-add-sheet.tsx";
import { Button } from "@director.run/studio/components/ui/button.tsx";
import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";

const meta = {
  title: "components/sheets/mcp-add-sheet",
  component: WorkspaceTargetAddSheet,
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof WorkspaceTargetAddSheet>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    onSubmit: (_data: WorkspaceTargetFormData) => Promise.resolve(),
    workspaces: [
      { id: "proxy-1", name: "Local Proxy" },
      { id: "proxy-2", name: "Remote Proxy" },
    ],
  },
  render: ({ workspaces: proxies }) => {
    const [open, setOpen] = useState(true);

    return (
      <div className="min-h-screen bg-surface p-8">
        <div className="mb-4 flex items-center gap-2">
          <Button onClick={() => setOpen((v) => !v)} variant="secondary">
            {open ? "Close Sheet" : "Open Sheet"}
          </Button>
        </div>
        <WorkspaceTargetAddSheet
          open={open}
          onOpenChange={setOpen}
          workspaces={proxies}
          onSubmit={(data: WorkspaceTargetFormData) => {
            console.log("Data:", JSON.stringify(data, null, 2));
          }}
          isSubmitting={false}
        />
      </div>
    );
  },
};

export const NotInstalled: Story = {
  ...Default,
  args: {
    ...Default.args,
    workspaces: undefined,
  },
};
