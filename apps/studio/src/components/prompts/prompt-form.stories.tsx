import { PromptForm } from "@director.run/design/components/prompts/prompt-form.tsx";
import { Button } from "@director.run/design/components/ui/button.tsx";
import type { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "components/forms/prompt-form",
  component: PromptForm,
  parameters: { layout: "padded" },
  args: {
    onSubmit: (data) => console.log("onSubmit", data),
    onDelete: () => console.log("onDelete"),
    isSubmitting: false,
  },
} satisfies Meta<typeof PromptForm>;

export default meta;
type Story = StoryObj<typeof meta>;

// Default state - creating a new prompt
export const Default: Story = {
  args: {
    prompt: null,
  },
};

// Editing an existing prompt
export const Editing: Story = {
  args: {
    prompt: {
      name: "Code Review Assistant",
      title: "Code Review Assistant",
      description: "A helpful assistant for reviewing code changes",
      body: "Please review the following code changes and provide feedback on:\n\n1. Code quality and best practices\n2. Potential bugs or issues\n3. Performance considerations\n4. Security implications\n\nBe constructive and specific in your feedback.",
    },
  },
};

// Submitting state
export const Submitting: Story = {
  args: {
    prompt: null,
    isSubmitting: true,
  },
};

// Editing with delete button
export const EditingWithDelete: Story = {
  args: {
    prompt: {
      name: "Bug Report Template",
      title: "Bug Report Template",
      description: "Template for reporting bugs",
      body: "**Bug Description:**\n\n**Steps to Reproduce:**\n1. \n2. \n3. \n\n**Expected Behavior:**\n\n**Actual Behavior:**\n\n**Environment:**\n- OS: \n- Browser: \n- Version: ",
    },
    onDelete: () => console.log("onDelete"),
  },
};

// Form validation - empty form
export const ValidationEmpty: Story = {
  args: {
    prompt: null,
  },
  render: (args) => (
    <div className="max-w-md">
      <PromptForm {...args} />
    </div>
  ),
};

// Form validation - partial form
export const ValidationPartial: Story = {
  args: {
    prompt: {
      name: "Incomplete Prompt",
      title: "Incomplete Prompt",
      description: "",
      body: "",
    },
  },
  render: (args) => (
    <div className="max-w-md">
      <PromptForm {...args} />
    </div>
  ),
};

// With secondary button
export const WithSecondaryButton: Story = {
  args: {
    prompt: null,
    secondaryButton: (
      <Button
        type="button"
        variant="secondary"
        onClick={() => console.log("Preview clicked")}
      >
        Preview
      </Button>
    ),
  },
};

// Editing with secondary button and delete
export const EditingWithSecondaryAndDelete: Story = {
  args: {
    prompt: {
      name: "Code Review Assistant",
      title: "Code Review Assistant",
      description: "A helpful assistant for reviewing code changes",
      body: "Please review the following code changes and provide feedback on:\n\n1. Code quality and best practices\n2. Potential bugs or issues\n3. Performance considerations\n4. Security implications\n\nBe constructive and specific in your feedback.",
    },
    onDelete: () => console.log("onDelete"),
    secondaryButton: (
      <Button
        type="button"
        variant="secondary"
        onClick={() => console.log("Test clicked")}
      >
        Test Prompt
      </Button>
    ),
  },
};
