import { Button } from "@director.run/design/components/ui/button.tsx";
import { Toaster, toast } from "@director.run/design/components/ui/toast.tsx";
import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";

const meta = {
  title: "components/toast",
  component: Toaster,
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof Toaster>;

export default meta;
type Story = StoryObj<typeof meta>;

// Interactive Demo - Single page with buttons to demonstrate different toast states
export const InteractiveDemo: Story = {
  render: () => {
    const [toastCount, setToastCount] = useState(0);

    const showSuccessToast = () => {
      setToastCount((prev) => prev + 1);
      toast({
        title: "Success!",
        description: "Your action was completed successfully.",
      });
    };

    const showErrorToast = () => {
      setToastCount((prev) => prev + 1);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
      });
    };

    const showWarningToast = () => {
      setToastCount((prev) => prev + 1);
      toast({
        title: "Warning",
        description: "Please review your input before proceeding.",
      });
    };

    const showInfoToast = () => {
      setToastCount((prev) => prev + 1);
      toast({
        title: "Information",
        description: "Here's some helpful information for you.",
      });
    };

    const showLongContentToast = () => {
      setToastCount((prev) => prev + 1);
      toast({
        title: "Long Content Toast",
        description:
          "This is a toast with a very long description that demonstrates how the component handles longer text content. It should wrap properly and maintain good readability.",
      });
    };

    const showShortToast = () => {
      setToastCount((prev) => prev + 1);
      toast({
        title: "Short",
        description: "Quick message.",
      });
    };

    const clearAllToasts = () => {
      // Note: In a real implementation, you'd need to track toast IDs to dismiss them
      // For this demo, we'll just reset the counter
      setToastCount(0);
    };

    return (
      <div className="min-h-screen bg-surface p-8">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8 text-center">
            <h1 className="mb-4 font-bold text-3xl text-fg">
              Toast Component Demo
            </h1>
            <p className="text-fg-subtle">
              Click the buttons below to see different toast states in action.
              {toastCount > 0 && (
                <span className="ml-2 text-sm">
                  ({toastCount} toast{toastCount !== 1 ? "s" : ""} shown)
                </span>
              )}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Success Toast */}
            <div className="rounded-lg border border-accent bg-accent/5 p-6">
              <h3 className="mb-3 font-semibold text-fg text-lg">
                Success Toast
              </h3>
              <p className="mb-4 text-fg-subtle text-sm">
                Shows a positive confirmation message.
              </p>
              <Button onClick={showSuccessToast} className="w-full">
                Show Success Toast
              </Button>
            </div>

            {/* Error Toast */}
            <div className="rounded-lg border border-red-200 bg-red-50 p-6 dark:border-red-800 dark:bg-red-950">
              <h3 className="mb-3 font-semibold text-fg text-lg">
                Error Toast
              </h3>
              <p className="mb-4 text-fg-subtle text-sm">
                Displays error messages and warnings.
              </p>
              <Button onClick={showErrorToast} className="w-full">
                Show Error Toast
              </Button>
            </div>

            {/* Warning Toast */}
            <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-6 dark:border-yellow-800 dark:bg-yellow-950">
              <h3 className="mb-3 font-semibold text-fg text-lg">
                Warning Toast
              </h3>
              <p className="mb-4 text-fg-subtle text-sm">
                Alerts users about potential issues.
              </p>
              <Button onClick={showWarningToast} className="w-full">
                Show Warning Toast
              </Button>
            </div>

            {/* Info Toast */}
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-6 dark:border-blue-800 dark:bg-blue-950">
              <h3 className="mb-3 font-semibold text-fg text-lg">Info Toast</h3>
              <p className="mb-4 text-fg-subtle text-sm">
                Provides helpful information to users.
              </p>
              <Button onClick={showInfoToast} className="w-full">
                Show Info Toast
              </Button>
            </div>

            {/* Long Content Toast */}
            <div className="rounded-lg border border-purple-200 bg-purple-50 p-6 dark:border-purple-800 dark:bg-purple-950">
              <h3 className="mb-3 font-semibold text-fg text-lg">
                Long Content
              </h3>
              <p className="mb-4 text-fg-subtle text-sm">
                Tests how the component handles longer text.
              </p>
              <Button onClick={showLongContentToast} className="w-full">
                Show Long Content Toast
              </Button>
            </div>

            {/* Short Toast */}
            <div className="rounded-lg border border-green-200 bg-green-50 p-6 dark:border-green-800 dark:bg-green-950">
              <h3 className="mb-3 font-semibold text-fg text-lg">
                Short Toast
              </h3>
              <p className="mb-4 text-fg-subtle text-sm">
                Demonstrates minimal content handling.
              </p>
              <Button onClick={showShortToast} className="w-full">
                Show Short Toast
              </Button>
            </div>
          </div>

          {/* Clear All Button */}
          <div className="mt-8 text-center">
            <Button onClick={clearAllToasts} variant="secondary" size="lg">
              Clear All Toasts
            </Button>
          </div>

          {/* Component Features */}
          <div className="mt-12 rounded-lg border border-accent bg-accent/5 p-6">
            <h2 className="mb-4 font-semibold text-fg text-xl">
              Toast Component Features
            </h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <h3 className="mb-2 font-medium text-fg">Design</h3>
                <ul className="space-y-1 text-fg-subtle text-sm">
                  <li>• Clean, modern design with rounded corners</li>
                  <li>• Consistent with the app's design system</li>
                  <li>• Responsive layout that works on all screen sizes</li>
                  <li>• Proper contrast for accessibility</li>
                </ul>
              </div>
              <div>
                <h3 className="mb-2 font-medium text-fg">Functionality</h3>
                <ul className="space-y-1 text-fg-subtle text-sm">
                  <li>• Dismissible with close button</li>
                  <li>• Auto-positioning at bottom-center</li>
                  <li>• Theme-aware (light/dark mode support)</li>
                  <li>• Customizable duration and behavior</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Toaster component - renders the actual toasts */}
        <Toaster />
      </div>
    );
  },
  parameters: {
    layout: "fullscreen",
  },
};

// Static Examples - Shows different toast states without interaction
export const StaticExamples: Story = {
  render: () => (
    <div className="min-h-screen bg-surface p-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-8 font-bold text-3xl text-fg">
          Toast Component - Static Examples
        </h1>

        <div className="space-y-6">
          {/* Success Example */}
          <div className="rounded-lg border border-accent bg-accent/5 p-6">
            <h3 className="mb-4 font-semibold text-fg text-lg">
              Success Toast
            </h3>
            <div className="flex w-full items-start justify-between rounded-xl bg-fg p-3 text-surface">
              <div className="flex flex-col gap-y-1">
                <p className="font-medium text-sm leading-tight">Success!</p>
                <p className="text-surface/70 text-xs">
                  Your action was completed successfully.
                </p>
              </div>
              <Button
                size="icon"
                variant="inverse"
                className="-top-2 -right-2 relative size-6"
              >
                <span className="sr-only">Close</span>
              </Button>
            </div>
          </div>

          {/* Error Example */}
          <div className="rounded-lg border border-red-200 bg-red-50 p-6 dark:border-red-800 dark:bg-red-950">
            <h3 className="mb-4 font-semibold text-fg text-lg">Error Toast</h3>
            <div className="flex w-full items-start justify-between rounded-xl bg-fg p-3 text-surface">
              <div className="flex flex-col gap-y-1">
                <p className="font-medium text-sm leading-tight">Error</p>
                <p className="text-surface/70 text-xs">
                  Something went wrong. Please try again.
                </p>
              </div>
              <Button
                size="icon"
                variant="inverse"
                className="-top-2 -right-2 relative size-6"
              >
                <span className="sr-only">Close</span>
              </Button>
            </div>
          </div>

          {/* Long Content Example */}
          <div className="rounded-lg border border-purple-200 bg-purple-50 p-6 dark:border-purple-800 dark:bg-purple-950">
            <h3 className="mb-4 font-semibold text-fg text-lg">
              Long Content Toast
            </h3>
            <div className="flex w-full items-start justify-between rounded-xl bg-fg p-3 text-surface">
              <div className="flex flex-col gap-y-1">
                <p className="font-medium text-sm leading-tight">
                  Long Content Toast
                </p>
                <p className="text-surface/70 text-xs">
                  This is a toast with a very long description that demonstrates
                  how the component handles longer text content. It should wrap
                  properly and maintain good readability.
                </p>
              </div>
              <Button
                size="icon"
                variant="inverse"
                className="-top-2 -right-2 relative size-6"
              >
                <span className="sr-only">Close</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    layout: "fullscreen",
  },
};
