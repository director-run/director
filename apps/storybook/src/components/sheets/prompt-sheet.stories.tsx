import { PromptSheet } from "@director.run/design/components/prompts/prompt-sheet.tsx";
import { Button } from "@director.run/design/components/ui/button.tsx";
import { Container } from "@director.run/design/components/ui/container.tsx";
import { mockPlaybook } from "@director.run/design/test/fixtures/playbook/playbook.ts";
import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { withLayoutView } from "../../helpers/decorators";

const Component = () => {
  const [open, setOpen] = useState(true);
  const prompt = mockPlaybook().prompts?.[0] ?? null;
  return (
    <Container size="lg">
      <div className="flex gap-2">
        <Button onClick={() => setOpen(true)}>Open Add</Button>
        <Button onClick={() => setOpen(true)} variant="secondary">
          Open Edit
        </Button>
      </div>
      <PromptSheet
        open={open}
        onOpenChange={setOpen}
        prompt={prompt}
        onSubmit={() => setOpen(false)}
        onClickDelete={() => setOpen(false)}
      />
    </Container>
  );
};

const meta = {
  title: "components/sheets/prompt-sheet",
  component: Component,
  parameters: { layout: "fullscreen" },
  decorators: [withLayoutView],
} satisfies Meta<typeof Component>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
