import type { ProxyFormData } from "@director.run/design/components/proxies/proxy-form.tsx";
import { ProxySettingsSheet } from "@director.run/design/components/proxies/proxy-settings-sheet.tsx";
import { Button } from "@director.run/design/components/ui/button.tsx";
import { mockWorkspace } from "@director.run/design/test/fixtures/workspace/workspace.ts";
import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";

const meta = {
  title: "components/sheets/proxy-settings-sheet",
  component: ProxySettingsSheet,
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof ProxySettingsSheet>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    proxy: mockWorkspace,
    onSubmit: (_data: ProxyFormData) => Promise.resolve(),
  },
  render: () => {
    const [open, setOpen] = useState(true);

    const proxy = mockWorkspace;

    const handleSubmit = (data: ProxyFormData) => {
      console.log("Updated proxy settings:", JSON.stringify(data, null, 2));
      return Promise.resolve();
    };

    return (
      <div className="min-h-screen bg-surface p-8">
        <div className="mb-4 flex items-center gap-2">
          <Button onClick={() => setOpen((v) => !v)} variant="secondary">
            {open ? "Close Sheet" : "Open Sheet"}
          </Button>
        </div>
        <ProxySettingsSheet
          open={open}
          onOpenChange={setOpen}
          proxy={proxy}
          onSubmit={handleSubmit}
        />
      </div>
    );
  },
};
