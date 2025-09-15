import { RegistryItemList } from "@director.run/studio/components/pages/registry-item-list.tsx";
import { Button } from "@director.run/studio/components/ui/button.tsx";
import { mockRegistryEntryList } from "@director.run/studio/test/fixtures/registry/entry-list.ts";
import { PlusIcon } from "@phosphor-icons/react";
import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { withLayoutView } from "../../helpers/decorators";

const meta = {
  title: "library/list",
  component: RegistryItemList,
  parameters: {
    layout: "fullscreen",
  },
  decorators: [withLayoutView],
} satisfies Meta<typeof RegistryItemList>;

export default meta;
type Story = StoryObj<typeof meta>;

const mockPagination = {
  pageIndex: 0,
  totalPages: 3,
  totalItems: 36,
  hasPreviousPage: false,
  hasNextPage: true,
};

export const Default: Story = {
  args: {
    entries: mockRegistryEntryList,
    pagination: mockPagination,
    searchQuery: "",
    onSearchChange: (query: string) => {
      console.log("Search query changed:", query);
    },
    onPageChange: (pageIndex: number) => {
      console.log("Page changed to:", pageIndex);
    },
    onAddManual: () => {
      console.log("Add manual clicked");
    },
    addManualButton: React.createElement(Button, { size: "sm" }, [
      React.createElement(PlusIcon, { key: "icon" }),
      " Add manually",
    ]),
  },
};
