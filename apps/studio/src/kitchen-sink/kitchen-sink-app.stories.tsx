import type { Meta, StoryObj } from "@storybook/react";
import { emptyKitchenSinkPlaybook } from "./lib/fixtures";
import { KitchenSinkApp } from "./lib/kitchen-sink-app";

/**
 * The flagship kitchen-sink story: a fully interactive mock of the Director
 * Studio app. The sidebar, menus, sheets, dialogs and toasts are all live and
 * driven by in-memory state — click around to move between playbooks, the
 * registry library, settings and onboarding.
 */
const meta = {
  title: "kitchen-sink/app",
  component: KitchenSinkApp,
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof KitchenSinkApp>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Desktop: Story = {};

export const Mobile: Story = {
  globals: { viewport: { value: "mobile2", isRotated: false } },
};

export const MobileSmall: Story = {
  globals: { viewport: { value: "mobile1", isRotated: false } },
};

export const Tablet: Story = {
  globals: { viewport: { value: "tablet", isRotated: false } },
};

export const SidebarLoading: Story = {
  args: { sidebarLoading: true },
  parameters: { chromatic: { disableSnapshot: true } },
};

export const LoadingStates: Story = {
  args: { pageState: "loading", sidebarLoading: true },
  parameters: { chromatic: { disableSnapshot: true } },
};

export const EmptyStates: Story = {
  args: { initialPlaybooks: [emptyKitchenSinkPlaybook()] },
};

export const ErrorState: Story = {
  args: { pageState: "error" },
};

export const Onboarding: Story = {
  args: { initialRoute: { name: "get-started" } },
};

export const DarkMode: Story = {
  globals: { darkMode: true },
};
