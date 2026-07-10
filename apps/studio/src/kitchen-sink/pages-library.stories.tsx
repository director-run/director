import { LayoutRoot } from "@director.run/design/components/layout/layout.tsx";
import type { NavigationSection } from "@director.run/design/components/layout/navigation.tsx";
import { MCPIcon } from "@director.run/design/components/ui/icons/mcp-icon.tsx";
import type { Decorator, Meta, StoryObj } from "@storybook/react";
import { kitchenSinkPlaybooks } from "./lib/fixtures";
import { LibraryRoute } from "./lib/routes/library-route";

const sections: NavigationSection[] = [
  {
    id: "registries",
    label: "Registries",
    items: [{ id: "mcp", label: "MCP", icon: <MCPIcon />, isActive: true }],
  },
  {
    id: "playbooks",
    label: "Playbooks",
    items: kitchenSinkPlaybooks().map((playbook) => ({
      id: playbook.id,
      label: playbook.name,
    })),
  },
];

const withSidebar: Decorator = (Story) => (
  <LayoutRoot sections={sections}>
    <Story />
  </LayoutRoot>
);

/**
 * The registry library page in each of its states. The real app has only a
 * loading-skeleton story today; these cover the populated, empty-search and
 * error states too. Interactive version: `kitchen-sink/app`.
 */
const meta = {
  title: "kitchen-sink/pages/library",
  component: LibraryRoute,
  parameters: { layout: "fullscreen" },
  decorators: [withSidebar],
  args: {
    playbooks: kitchenSinkPlaybooks(),
    navigate: () => {},
    pageState: "default",
  },
} satisfies Meta<typeof LibraryRoute>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const EmptySearch: Story = {
  args: { initialSearchQuery: "no-such-server-xyz" },
};

export const Loading: Story = {
  args: { pageState: "loading" },
  parameters: { chromatic: { disableSnapshot: true } },
};

export const Error: Story = {
  args: { pageState: "error" },
};
