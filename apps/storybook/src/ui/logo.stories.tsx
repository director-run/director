import { Logo } from "@director.run/design/components/ui/icons/logo.tsx";
import type { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "ui/Logo",
  component: Logo,
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof Logo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="flex flex-col items-center gap-8 p-8">
      <h2 className="mb-4 font-bold text-2xl">
        Logo Component - All Variations
      </h2>

      {/* Size variations */}
      <div className="grid w-full max-w-4xl grid-cols-2 gap-6 md:grid-cols-4">
        <div className="flex flex-col items-center gap-2 rounded-lg border-2 border-gray-200 p-4">
          <h3 className="text-center font-medium text-sm">Small (w-4 h-4)</h3>
          <Logo className="h-4 w-4" />
        </div>

        <div className="flex flex-col items-center gap-2 rounded-lg border-2 border-gray-200 p-4">
          <h3 className="text-center font-medium text-sm">Medium (w-8 h-8)</h3>
          <Logo className="h-8 w-8" />
        </div>

        <div className="flex flex-col items-center gap-2 rounded-lg border-2 border-gray-200 p-4">
          <h3 className="text-center font-medium text-sm">Large (w-12 h-12)</h3>
          <Logo className="h-12 w-12" />
        </div>

        <div className="flex flex-col items-center gap-2 rounded-lg border-2 border-gray-200 p-4">
          <h3 className="text-center font-medium text-sm">
            Extra Large (w-16 h-16)
          </h3>
          <Logo className="h-16 w-16" />
        </div>
      </div>

      {/* Color variations */}
      <div className="grid w-full max-w-4xl grid-cols-2 gap-6 md:grid-cols-4">
        <div className="flex flex-col items-center gap-2 rounded-lg border-2 border-gray-200 p-4">
          <h3 className="text-center font-medium text-sm">Default Color</h3>
          <Logo className="h-8 w-8" />
        </div>

        <div className="flex flex-col items-center gap-2 rounded-lg border-2 border-gray-200 p-4">
          <h3 className="text-center font-medium text-sm">Red</h3>
          <Logo className="h-8 w-8 text-red-600" />
        </div>

        <div className="flex flex-col items-center gap-2 rounded-lg border-2 border-gray-200 p-4">
          <h3 className="text-center font-medium text-sm">Blue</h3>
          <Logo className="h-8 w-8 text-blue-600" />
        </div>

        <div className="flex flex-col items-center gap-2 rounded-lg border-2 border-gray-200 p-4">
          <h3 className="text-center font-medium text-sm">Green</h3>
          <Logo className="h-8 w-8 text-green-600" />
        </div>
      </div>

      {/* Background variations */}
      <div className="grid w-full max-w-4xl grid-cols-2 gap-6 md:grid-cols-4">
        <div className="flex flex-col items-center gap-2 rounded-lg border-2 border-gray-200 bg-gray-100 p-4">
          <h3 className="text-center font-medium text-sm">Light Background</h3>
          <Logo className="h-8 w-8" />
        </div>

        <div className="flex flex-col items-center gap-2 rounded-lg border-2 border-gray-200 bg-gray-800 p-4">
          <h3 className="text-center font-medium text-sm">Dark Background</h3>
          <Logo className="h-8 w-8 text-white" />
        </div>

        <div className="flex flex-col items-center gap-2 rounded-lg border-2 border-gray-200 bg-red-100 p-4">
          <h3 className="text-center font-medium text-sm">Red Background</h3>
          <Logo className="h-8 w-8 text-red-600" />
        </div>

        <div className="flex flex-col items-center gap-2 rounded-lg border-2 border-gray-200 bg-blue-100 p-4">
          <h3 className="text-center font-medium text-sm">Blue Background</h3>
          <Logo className="h-8 w-8 text-blue-600" />
        </div>
      </div>
    </div>
  ),
  parameters: {
    layout: "fullscreen",
  },
};
