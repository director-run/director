import { PlaybookTargetAddSheet } from "@director.run/design/components/mcp-servers/mcp-add-sheet.tsx";
import type { PlaybookTargetFormData } from "@director.run/design/components/mcp-servers/mcp-add-sheet.tsx";
import { Button } from "@director.run/design/components/ui/button.tsx";
import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";

const meta = {
  title: "components/sheets/mcp-add-sheet",
  component: PlaybookTargetAddSheet,
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof PlaybookTargetAddSheet>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    onSubmit: (_data: PlaybookTargetFormData) => Promise.resolve(),
    playbooks: [
      { id: "playbook-1", name: "Local Playbook" },
      { id: "playbook-2", name: "Remote Playbook" },
    ],
  },
  render: ({ playbooks: playbooks }) => {
    const [open, setOpen] = useState(true);

    return (
      <div className="min-h-screen bg-surface p-8">
        <div className="mb-4 flex items-center gap-2">
          <Button onClick={() => setOpen((v) => !v)} variant="secondary">
            {open ? "Close Sheet" : "Open Sheet"}
          </Button>
        </div>
        <PlaybookTargetAddSheet
          open={open}
          onOpenChange={setOpen}
          playbooks={playbooks}
          onSubmit={(data: PlaybookTargetFormData) => {
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
    playbooks: undefined,
  },
};
