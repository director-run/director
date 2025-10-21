import { PlaybookManualDialog } from "@director.run/design/components/playbooks-clients/playbook-manual-connection-dialog.tsx";
import { Button } from "@director.run/design/components/ui/button.tsx";
import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";

const meta = {
  title: "components/playbooks/playbook-manual-dialog",
  component: PlaybookManualDialog,
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof PlaybookManualDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    playbookId: "playbook-123",
    gatewayBaseUrl: "https://gateway.example.com",
    onCopy: (text: string) => console.log("Copied:", text),
  },
  render: ({ playbookId: playbookId, gatewayBaseUrl, onCopy }) => {
    const [open, setOpen] = useState(true);

    return (
      <div className="min-h-screen bg-surface p-8">
        <div className="mb-4">
          <Button onClick={() => setOpen(true)} variant="secondary">
            Open Dialog
          </Button>
        </div>
        <PlaybookManualDialog
          open={open}
          onOpenChange={setOpen}
          playbookId={playbookId}
          gatewayBaseUrl={gatewayBaseUrl}
          onCopy={onCopy}
        />
      </div>
    );
  },
};
