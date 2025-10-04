import { PromptList } from "@director.run/design/components/prompts/prompt-list.tsx";
import type { WorkspaceDetail } from "@director.run/design/components/types.ts";
import { Container } from "@director.run/design/components/ui/container.tsx";
import { mockWorkspace } from "@director.run/design/test/fixtures/workspace/workspace.ts";
import type { Meta, StoryObj } from "@storybook/react";
import { withLayoutView } from "../../helpers/decorators";

const Component = ({ workspace }: { workspace: WorkspaceDetail }) => (
  <Container size="lg">
    <PromptList
      prompts={workspace.prompts ?? []}
      onClickAddPrompt={() => console.log("add")}
      onClickPrompt={(p) => console.log(p)}
    />
  </Container>
);

const meta = {
  title: "components/workspaces/prompt-list",
  component: Component,
  parameters: { layout: "fullscreen" },
  decorators: [withLayoutView],
} satisfies Meta<typeof Component>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    workspace: mockWorkspace(),
  },
};
