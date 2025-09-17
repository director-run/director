import { RegistryToolSheet } from "@director.run/studio/components/registry/registry-tool-sheet.tsx";
import type { MCPTool } from "@director.run/studio/components/types.ts";
import { Button } from "@director.run/studio/components/ui/button.tsx";
import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";

// Mock tool data
const mockToolWithSchema: MCPTool = {
  name: "search_repositories",
  description:
    "Search for repositories on GitHub using various filters and sorting options. This tool allows you to find repositories based on keywords, language, stars, and other criteria.",
  inputSchema: {
    type: "object",
    properties: {
      query: {
        type: "string",
        description: "The search query to find repositories",
      },
      sort: {
        type: "string",
        description: "Sort results by",
      },
      order: {
        type: "string",
        description: "Sort order",
      },
      per_page: {
        type: "integer",
        description: "Number of results per page",
      },
      page: {
        type: "integer",
        description: "Page number",
      },
    },
    required: ["query"],
  },
};

const mockToolWithoutSchema: MCPTool = {
  name: "get_user_info",
  description:
    "Get information about the authenticated user. This tool retrieves basic profile information and account details for the currently authenticated GitHub user.",
  inputSchema: {
    type: "object",
    properties: {},
    required: [],
  },
};

const mockToolWithComplexSchema: MCPTool = {
  name: "create_issue",
  description:
    "Create a new issue in a GitHub repository. This tool allows you to create issues with titles, descriptions, labels, assignees, and milestones.",
  inputSchema: {
    type: "object",
    properties: {
      owner: {
        type: "string",
        description: "The account owner of the repository",
      },
      repo: {
        type: "string",
        description: "The name of the repository",
      },
      title: {
        type: "string",
        description: "The title of the issue",
      },
      body: {
        type: "string",
        description: "The contents of the issue",
      },
      labels: {
        type: "array",
        description: "Labels to associate with this issue",
      },
      assignees: {
        type: "array",
        description: "Logins for Users to assign to this issue",
      },
      milestone: {
        type: "integer",
        description: "The number of the milestone to associate this issue with",
      },
    },
    required: ["owner", "repo", "title"],
  },
};

const meta = {
  title: "components/sheets/registry-tool-sheet",
  component: RegistryToolSheet,
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof RegistryToolSheet>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    tool: mockToolWithComplexSchema,
    mcpName: "GitHub",
    onClose: () => {},
  },
  render: () => {
    const [open, setOpen] = useState(true);

    const handleClose = () => {
      console.log("Tool sheet closed");
      setOpen(false);
    };

    return (
      <div className="min-h-screen bg-surface p-8">
        <div className="mb-4 flex items-center gap-2">
          <Button onClick={() => setOpen((v) => !v)} variant="secondary">
            {open ? "Close Sheet" : "Open Sheet"}
          </Button>
        </div>
        {open && (
          <RegistryToolSheet
            tool={mockToolWithComplexSchema}
            mcpName="GitHub"
            onClose={handleClose}
          />
        )}
      </div>
    );
  },
};

export const WithoutInputSchema: Story = {
  args: {
    tool: mockToolWithoutSchema,
    mcpName: "GitHub",
    onClose: () => {},
  },
  render: () => {
    const [open, setOpen] = useState(true);

    const handleClose = () => {
      console.log("Tool sheet closed");
      setOpen(false);
    };

    return (
      <div className="min-h-screen bg-surface p-8">
        <div className="mb-4 flex items-center gap-2">
          <Button onClick={() => setOpen((v) => !v)} variant="secondary">
            {open ? "Close Sheet" : "Open Sheet"}
          </Button>
        </div>
        {open && (
          <RegistryToolSheet
            tool={mockToolWithoutSchema}
            mcpName="GitHub"
            onClose={handleClose}
          />
        )}
      </div>
    );
  },
};
