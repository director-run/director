import { RegistryItemList } from "@director.run/design/components/pages/registry-item-list.tsx";
import { mockRegistryEntryList } from "@director.run/design/test/fixtures/registry/entry-list.ts";
import type { Meta, StoryObj } from "@storybook/react";
import { withLayoutView } from "../helpers/decorators";

const meta = {
  title: "pages/registry/list",
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
    onSearchQueryChange: (query: string) => {
      console.log("Search query changed:", query);
    },
    onPageChange: (pageIndex: number) => {
      console.log("Page changed to:", pageIndex);
    },
    onManualAddClick: () => {
      console.log("Add manual clicked");
    },
    onEntryClick: (entryName: string) => {
      console.log("Entry clicked:", entryName);
    },
  },
};
