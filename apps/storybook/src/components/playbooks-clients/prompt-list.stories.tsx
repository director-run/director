import { PromptList } from "@director.run/design/components/prompts/prompt-list.tsx";
import type { PlaybookDetail } from "@director.run/design/components/types.ts";
import { Container } from "@director.run/design/components/ui/container.tsx";
import { mockPlaybook } from "@director.run/design/test/fixtures/playbook/playbook.ts";
import type { Meta, StoryObj } from "@storybook/react";
import { withLayoutView } from "../../helpers/decorators";

const Component = ({ playbook }: { playbook: PlaybookDetail }) => (
  <Container size="lg">
    <PromptList
      prompts={playbook.prompts ?? []}
      onCreatePrompt={() => console.log("add")}
      onEditPrompt={(p) => console.log(p)}
      onDeletePrompt={(p) => console.log(p)}
      isSavingPrompt={false}
    />
  </Container>
);

const meta = {
  title: "components/playbooks-clients/prompt-list",
  component: Component,
  parameters: { layout: "fullscreen" },
  decorators: [withLayoutView],
} satisfies Meta<typeof Component>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    playbook: mockPlaybook(),
  },
};
