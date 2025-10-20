import { ProxyManualDialog } from "@director.run/design/components/playbooks-clients/playbook-manual-connection-dialog.tsx";
import { Button } from "@director.run/design/components/ui/button.tsx";
import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";

const meta = {
  title: "components/playbooks/playbook-manual-dialog",
  component: ProxyManualDialog,
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof ProxyManualDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    proxyId: "proxy-123",
    gatewayBaseUrl: "https://gateway.example.com",
    onCopy: (text: string) => console.log("Copied:", text),
  },
  render: ({ proxyId, gatewayBaseUrl, onCopy }) => {
    const [open, setOpen] = useState(true);

    return (
      <div className="min-h-screen bg-surface p-8">
        <div className="mb-4">
          <Button onClick={() => setOpen(true)} variant="secondary">
            Open Dialog
          </Button>
        </div>
        <ProxyManualDialog
          open={open}
          onOpenChange={setOpen}
          proxyId={proxyId}
          gatewayBaseUrl={gatewayBaseUrl}
          onCopy={onCopy}
        />
      </div>
    );
  },
};
