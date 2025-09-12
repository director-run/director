import type { Meta, StoryObj } from "@storybook/react";
import { McpLogo } from "./mcp-logo";

const meta = {
  title: "components/McpLogo",
  component: McpLogo,
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof McpLogo>;

export default meta;
type Story = StoryObj<typeof meta>;

// All States View - Single sheet with all variations
export const AllStates: Story = {
  render: () => (
    <div className="flex flex-col items-center gap-8 p-8">
      <h2 className="mb-4 text-2xl font-bold">
        McpLogo Component - All States
      </h2>

      {/* Default states */}
      <div className="grid w-full max-w-4xl grid-cols-2 gap-6 md:grid-cols-4">
        <div className="flex flex-col items-center gap-2 rounded-lg border-2 border-green-500 p-4">
          <h3 className="text-center text-sm font-medium">
            Default (Fallback)
          </h3>
          <McpLogo />
        </div>

        <div className="flex flex-col items-center gap-2 rounded-lg border-2 border-green-500 p-4">
          <h3 className="text-center text-sm font-medium">
            With External Icon
          </h3>
          <McpLogo src="https://github.com/github.png" />
        </div>

        <div className="flex flex-col items-center gap-2 rounded-lg border-2 border-green-500 p-4">
          <h3 className="text-center text-sm font-medium">
            With Relative Icon
          </h3>
          <McpLogo src="public/github.svg" />
        </div>

        <div className="flex flex-col items-center gap-2 rounded-lg border-2 border-green-500 p-4">
          <h3 className="text-center text-sm font-medium">With Null Src</h3>
          <McpLogo src={null} />
        </div>
      </div>

      {/* Size variations */}
      <div className="grid w-full max-w-4xl grid-cols-2 gap-6 md:grid-cols-4">
        <div className="flex flex-col items-center gap-2 rounded-lg border-2 border-green-500 p-4">
          <h3 className="text-center text-sm font-medium">Small (size-6)</h3>
          <McpLogo className="size-6" />
        </div>

        <div className="flex flex-col items-center gap-2 rounded-lg border-2 border-green-500 p-4">
          <h3 className="text-center text-sm font-medium">Medium (size-8)</h3>
          <McpLogo className="size-8" />
        </div>

        <div className="flex flex-col items-center gap-2 rounded-lg border-2 border-green-500 p-4">
          <h3 className="text-center text-sm font-medium">Large (size-9)</h3>
          <McpLogo className="size-9" />
        </div>

        <div className="flex flex-col items-center gap-2 rounded-lg border-2 border-green-500 p-4">
          <h3 className="text-center text-sm font-medium">
            Extra Large (size-12)
          </h3>
          <McpLogo className="size-12" />
        </div>
      </div>

      {/* With icons and different sizes */}
      <div className="grid w-full max-w-4xl grid-cols-2 gap-6 md:grid-cols-4">
        <div className="flex flex-col items-center gap-2 rounded-lg border-2 border-green-500 p-4">
          <h3 className="text-center text-sm font-medium">Small with Icon</h3>
          <McpLogo src="https://github.com/github.png" className="size-6" />
        </div>

        <div className="flex flex-col items-center gap-2 rounded-lg border-2 border-green-500 p-4">
          <h3 className="text-center text-sm font-medium">Medium with Icon</h3>
          <McpLogo src="https://github.com/github.png" className="size-8" />
        </div>

        <div className="flex flex-col items-center gap-2 rounded-lg border-2 border-green-500 p-4">
          <h3 className="text-center text-sm font-medium">Large with Icon</h3>
          <McpLogo src="https://github.com/github.png" className="size-9" />
        </div>

        <div className="flex flex-col items-center gap-2 rounded-lg border-2 border-green-500 p-4">
          <h3 className="text-center text-sm font-medium">XL with Icon</h3>
          <McpLogo src="https://github.com/github.png" className="size-12" />
        </div>
      </div>

      {/* Different icon types */}
      <div className="grid w-full max-w-4xl grid-cols-2 gap-6 md:grid-cols-4">
        <div className="flex flex-col items-center gap-2 rounded-lg border-2 border-green-500 p-4">
          <h3 className="text-center text-sm font-medium">GitHub</h3>
          <McpLogo src="https://github.com/github.png" className="size-8" />
        </div>

        <div className="flex flex-col items-center gap-2 rounded-lg border-2 border-green-500 p-4">
          <h3 className="text-center text-sm font-medium">Notion</h3>
          <McpLogo src="public/notion.svg" className="size-8" />
        </div>

        <div className="flex flex-col items-center gap-2 rounded-lg border-2 border-green-500 p-4">
          <h3 className="text-center text-sm font-medium">Slack</h3>
          <McpLogo src="public/slack.svg" className="size-8" />
        </div>

        <div className="flex flex-col items-center gap-2 rounded-lg border-2 border-green-500 p-4">
          <h3 className="text-center text-sm font-medium">Figma</h3>
          <McpLogo src="public/figma.svg" className="size-8" />
        </div>
      </div>

      {/* Error states */}
      <div className="grid w-full max-w-4xl grid-cols-2 gap-6 md:grid-cols-4">
        <div className="flex flex-col items-center gap-2 rounded-lg border-2 border-green-500 p-4">
          <h3 className="text-center text-sm font-medium">Invalid URL</h3>
          <McpLogo src="invalid-url" className="size-8" />
        </div>

        <div className="flex flex-col items-center gap-2 rounded-lg border-2 border-green-500 p-4">
          <h3 className="text-center text-sm font-medium">Empty String</h3>
          <McpLogo src="" className="size-8" />
        </div>

        <div className="flex flex-col items-center gap-2 rounded-lg border-2 border-green-500 p-4">
          <h3 className="text-center text-sm font-medium">Undefined Src</h3>
          <McpLogo src={undefined} className="size-8" />
        </div>

        <div className="flex flex-col items-center gap-2 rounded-lg border-2 border-green-500 p-4">
          <h3 className="text-center text-sm font-medium">Broken Image</h3>
          <McpLogo
            src="https://example.com/broken-image.png"
            className="size-8"
          />
        </div>
      </div>
    </div>
  ),
  parameters: {
    layout: "fullscreen",
  },
};
