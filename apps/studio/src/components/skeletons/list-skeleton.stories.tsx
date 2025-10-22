import { ListSkeleton } from "@director.run/design/components/loaders/list-skeleton.tsx";
import { Container } from "@director.run/design/components/ui/container.tsx";
import type { Meta, StoryObj } from "@storybook/react";
import { withLayoutView } from "../../helpers/decorators";

const meta = {
  title: "components/skeletons/list-skeleton",
  parameters: {
    layout: "fullscreen",
  },
  decorators: [withLayoutView],
  render: () => (
    <Container size="lg">
      <ListSkeleton />
    </Container>
  ),
} satisfies Meta<typeof ListSkeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
