import { McpLogo } from "@director.run/design/components/mcp-logo.tsx";
import type { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "ui/McpLogo",
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
      <h2 className="mb-4 font-bold text-2xl">
        McpLogo Component - All States
      </h2>

      {/* Default states */}
      <div className="grid w-full max-w-4xl grid-cols-2 gap-6 md:grid-cols-4">
        <div className="flex flex-col items-center gap-2 rounded-lg border-2 border-green-500 p-4">
          <h3 className="text-center font-medium text-sm">
            Default (Fallback)
          </h3>
          <McpLogo />
        </div>

        <div className="flex flex-col items-center gap-2 rounded-lg border-2 border-green-500 p-4">
          <h3 className="text-center font-medium text-sm">
            With External Icon
          </h3>
          <McpLogo src="https://github.com/github.png" />
        </div>

        <div className="flex flex-col items-center gap-2 rounded-lg border-2 border-green-500 p-4">
          <h3 className="text-center font-medium text-sm">
            With Relative Icon
          </h3>
          <McpLogo src="public/github.svg" />
        </div>

        <div className="flex flex-col items-center gap-2 rounded-lg border-2 border-green-500 p-4">
          <h3 className="text-center font-medium text-sm">With Null Src</h3>
          <McpLogo />
        </div>
      </div>

      {/* Size variations */}
      <div className="grid w-full max-w-4xl grid-cols-2 gap-6 md:grid-cols-4">
        <div className="flex flex-col items-center gap-2 rounded-lg border-2 border-green-500 p-4">
          <h3 className="text-center font-medium text-sm">Small (size-6)</h3>
          <McpLogo className="size-6" />
        </div>

        <div className="flex flex-col items-center gap-2 rounded-lg border-2 border-green-500 p-4">
          <h3 className="text-center font-medium text-sm">Medium (size-8)</h3>
          <McpLogo className="size-8" />
        </div>

        <div className="flex flex-col items-center gap-2 rounded-lg border-2 border-green-500 p-4">
          <h3 className="text-center font-medium text-sm">Large (size-9)</h3>
          <McpLogo className="size-9" />
        </div>

        <div className="flex flex-col items-center gap-2 rounded-lg border-2 border-green-500 p-4">
          <h3 className="text-center font-medium text-sm">
            Extra Large (size-12)
          </h3>
          <McpLogo className="size-12" />
        </div>
      </div>

      {/* With icons and different sizes */}
      <div className="grid w-full max-w-4xl grid-cols-2 gap-6 md:grid-cols-4">
        <div className="flex flex-col items-center gap-2 rounded-lg border-2 border-green-500 p-4">
          <h3 className="text-center font-medium text-sm">Small with Icon</h3>
          <McpLogo src="https://github.com/github.png" className="size-6" />
        </div>

        <div className="flex flex-col items-center gap-2 rounded-lg border-2 border-green-500 p-4">
          <h3 className="text-center font-medium text-sm">Medium with Icon</h3>
          <McpLogo src="https://github.com/github.png" className="size-8" />
        </div>

        <div className="flex flex-col items-center gap-2 rounded-lg border-2 border-green-500 p-4">
          <h3 className="text-center font-medium text-sm">Large with Icon</h3>
          <McpLogo src="https://github.com/github.png" className="size-9" />
        </div>

        <div className="flex flex-col items-center gap-2 rounded-lg border-2 border-green-500 p-4">
          <h3 className="text-center font-medium text-sm">XL with Icon</h3>
          <McpLogo src="https://github.com/github.png" className="size-12" />
        </div>
      </div>

      {/* Different icon types */}
      <div className="grid w-full max-w-4xl grid-cols-2 gap-6 md:grid-cols-4">
        <div className="flex flex-col items-center gap-2 rounded-lg border-2 border-green-500 p-4">
          <h3 className="text-center font-medium text-sm">GitHub</h3>
          <McpLogo src="https://github.com/github.png" className="size-8" />
        </div>

        <div className="flex flex-col items-center gap-2 rounded-lg border-2 border-green-500 p-4">
          <h3 className="text-center font-medium text-sm">Notion</h3>
          <McpLogo src="public/notion.svg" className="size-8" />
        </div>

        <div className="flex flex-col items-center gap-2 rounded-lg border-2 border-green-500 p-4">
          <h3 className="text-center font-medium text-sm">Slack</h3>
          <McpLogo src="public/slack.svg" className="size-8" />
        </div>

        <div className="flex flex-col items-center gap-2 rounded-lg border-2 border-green-500 p-4">
          <h3 className="text-center font-medium text-sm">Figma</h3>
          <McpLogo src="public/figma.svg" className="size-8" />
        </div>
      </div>

      {/* Error states */}
      <div className="grid w-full max-w-4xl grid-cols-2 gap-6 md:grid-cols-4">
        <div className="flex flex-col items-center gap-2 rounded-lg border-2 border-green-500 p-4">
          <h3 className="text-center font-medium text-sm">Invalid URL</h3>
          <McpLogo src="invalid-url" className="size-8" />
        </div>

        <div className="flex flex-col items-center gap-2 rounded-lg border-2 border-green-500 p-4">
          <h3 className="text-center font-medium text-sm">Empty String</h3>
          <McpLogo src="" className="size-8" />
        </div>

        <div className="flex flex-col items-center gap-2 rounded-lg border-2 border-green-500 p-4">
          <h3 className="text-center font-medium text-sm">Undefined Src</h3>
          <McpLogo src={undefined} className="size-8" />
        </div>

        <div className="flex flex-col items-center gap-2 rounded-lg border-2 border-green-500 p-4">
          <h3 className="text-center font-medium text-sm">Broken Image</h3>
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
