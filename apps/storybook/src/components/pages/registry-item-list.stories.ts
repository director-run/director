import { RegistryItemList } from "@director.run/studio/components/pages/registry-item-list.tsx";
import { Button } from "@director.run/studio/components/ui/button.tsx";
import { PlusIcon } from "@phosphor-icons/react";
import type { Meta, StoryObj } from "@storybook/react";
import React from "react";

const meta = {
  title: "pages/RegistryItemList",
  component: RegistryItemList,
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof RegistryItemList>;

export default meta;
type Story = StoryObj<typeof meta>;

// Mock data for registry entries
const mockEntries = [
  {
    id: "github-mcp",
    name: "github-mcp",
    title: "GitHub MCP Server",
  },
  {
    id: "filesystem-mcp",
    name: "filesystem-mcp",
    title: "Filesystem MCP Server",
  },
  {
    id: "sqlite-mcp",
    name: "sqlite-mcp",
    title: "SQLite MCP Server",
  },
  {
    id: "brave-search-mcp",
    name: "brave-search-mcp",
    title: "Brave Search MCP Server",
  },
  {
    id: "postgres-mcp",
    name: "postgres-mcp",
    title: "PostgreSQL MCP Server",
  },
  {
    id: "notion-mcp",
    name: "notion-mcp",
    title: "Notion MCP Server",
  },
  {
    id: "slack-mcp",
    name: "slack-mcp",
    title: "Slack MCP Server",
  },
  {
    id: "figma-mcp",
    name: "figma-mcp",
    title: "Figma MCP Server",
  },
  {
    id: "airtable-mcp",
    name: "airtable-mcp",
    title: "Airtable MCP Server",
  },
  {
    id: "google-drive-mcp",
    name: "google-drive-mcp",
    title: "Google Drive MCP Server",
  },
  {
    id: "linear-mcp",
    name: "linear-mcp",
    title: "Linear MCP Server",
  },
  {
    id: "jira-mcp",
    name: "jira-mcp",
    title: "Jira MCP Server",
  },
];

const mockPagination = {
  pageIndex: 0,
  totalPages: 3,
  totalItems: 36,
  hasPreviousPage: false,
  hasNextPage: true,
};

const mockPaginationMiddle = {
  pageIndex: 1,
  totalPages: 3,
  totalItems: 36,
  hasPreviousPage: true,
  hasNextPage: true,
};

const mockPaginationLast = {
  pageIndex: 2,
  totalPages: 3,
  totalItems: 36,
  hasPreviousPage: true,
  hasNextPage: false,
};

const mockPaginationSingle = {
  pageIndex: 0,
  totalPages: 1,
  totalItems: 12,
  hasPreviousPage: false,
  hasNextPage: false,
};

export const Default: Story = {
  args: {
    entries: mockEntries,
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

export const WithSearchQuery: Story = {
  args: {
    ...Default.args,
    searchQuery: "github",
  },
};

export const MiddlePage: Story = {
  args: {
    ...Default.args,
    pagination: mockPaginationMiddle,
  },
};

export const LastPage: Story = {
  args: {
    ...Default.args,
    pagination: mockPaginationLast,
  },
};

export const SinglePage: Story = {
  args: {
    ...Default.args,
    pagination: mockPaginationSingle,
  },
};

export const EmptyResults: Story = {
  args: {
    ...Default.args,
    entries: [],
    searchQuery: "nonexistent",
  },
};

export const LoadingState: Story = {
  args: {
    ...Default.args,
    entries: [],
    searchQuery: "",
  },
};

export const ManyEntries: Story = {
  args: {
    ...Default.args,
    entries: [
      ...mockEntries,
      {
        id: "discord-mcp",
        name: "discord-mcp",
        title: "Discord MCP Server",
      },
      {
        id: "telegram-mcp",
        name: "telegram-mcp",
        title: "Telegram MCP Server",
      },
      {
        id: "twitter-mcp",
        name: "twitter-mcp",
        title: "Twitter MCP Server",
      },
      {
        id: "reddit-mcp",
        name: "reddit-mcp",
        title: "Reddit MCP Server",
      },
      {
        id: "youtube-mcp",
        name: "youtube-mcp",
        title: "YouTube MCP Server",
      },
      {
        id: "spotify-mcp",
        name: "spotify-mcp",
        title: "Spotify MCP Server",
      },
      {
        id: "netflix-mcp",
        name: "netflix-mcp",
        title: "Netflix MCP Server",
      },
      {
        id: "amazon-mcp",
        name: "amazon-mcp",
        title: "Amazon MCP Server",
      },
      {
        id: "shopify-mcp",
        name: "shopify-mcp",
        title: "Shopify MCP Server",
      },
      {
        id: "stripe-mcp",
        name: "stripe-mcp",
        title: "Stripe MCP Server",
      },
      {
        id: "paypal-mcp",
        name: "paypal-mcp",
        title: "PayPal MCP Server",
      },
      {
        id: "square-mcp",
        name: "square-mcp",
        title: "Square MCP Server",
      },
    ],
  },
};

export const LongTitles: Story = {
  args: {
    ...Default.args,
    entries: [
      {
        id: "very-long-title-mcp",
        name: "very-long-title-mcp",
        title: "Very Long MCP Server Title That Should Wrap Nicely in the UI",
      },
      {
        id: "another-very-long-title-mcp",
        name: "another-very-long-title-mcp",
        title:
          "Another Very Long MCP Server Title That Should Also Wrap Nicely in the UI and Test the Layout",
      },
      {
        id: "short-mcp",
        name: "short-mcp",
        title: "Short",
      },
    ],
  },
};
