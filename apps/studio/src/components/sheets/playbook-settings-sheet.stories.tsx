import type { PlaybookFormData } from "@director.run/design/components/playbooks/playbook-form.tsx";
import { PlaybookSettingsSheet } from "@director.run/design/components/playbooks/playbook-settings-sheet.tsx";
import { Button } from "@director.run/design/components/ui/button.tsx";
import { mockPlaybook } from "@director.run/design/test/fixtures/playbook/playbook.ts";
import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";

const meta = {
  title: "components/sheets/playbook-settings-sheet",
  component: PlaybookSettingsSheet,
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof PlaybookSettingsSheet>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    playbook: mockPlaybook(),
    onSubmit: (_data: PlaybookFormData) => Promise.resolve(),
  },
  render: () => {
    const [open, setOpen] = useState(true);

    const playbook = mockPlaybook();

    const handleSubmit = (data: PlaybookFormData) => {
      console.log("Updated playbook settings:", JSON.stringify(data, null, 2));
      return Promise.resolve();
    };

    return (
      <div className="min-h-screen bg-surface p-8">
        <div className="mb-4 flex items-center gap-2">
          <Button onClick={() => setOpen((v) => !v)} variant="secondary">
            {open ? "Close Sheet" : "Open Sheet"}
          </Button>
        </div>
        <PlaybookSettingsSheet
          open={open}
          onOpenChange={setOpen}
          playbook={playbook}
          onSubmit={handleSubmit}
        />
      </div>
    );
  },
};
