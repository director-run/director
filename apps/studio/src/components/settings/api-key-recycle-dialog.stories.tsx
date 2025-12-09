import { ApiKeyRecycleDialog } from "@director.run/design/components/settings/api-key-recycle-dialog.tsx";
import { Button } from "@director.run/design/components/ui/button.tsx";
import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";

const meta = {
  title: "components/settings/api-key-recycle-dialog",
  component: ApiKeyRecycleDialog,
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof ApiKeyRecycleDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    newApiKey: null,
    isRecycling: false,
    onConfirmRecycle: () => console.log("Confirm recycle clicked"),
    onCopy: (text: string) => console.log("Copied:", text),
  },
  render: ({ newApiKey, isRecycling, onConfirmRecycle, onCopy }) => {
    const [open, setOpen] = useState(true);

    return (
      <div className="min-h-screen bg-surface p-8">
        <div className="mb-4">
          <Button onClick={() => setOpen(true)} variant="secondary">
            Open Dialog
          </Button>
        </div>
        <ApiKeyRecycleDialog
          open={open}
          onOpenChange={setOpen}
          newApiKey={newApiKey}
          isRecycling={isRecycling}
          onConfirmRecycle={onConfirmRecycle}
          onCopy={onCopy}
        />
      </div>
    );
  },
};

export const Recycling: Story = {
  args: {
    newApiKey: null,
    isRecycling: true,
    onConfirmRecycle: () => console.log("Confirm recycle clicked"),
    onCopy: (text: string) => console.log("Copied:", text),
  },
  render: ({ newApiKey, isRecycling, onConfirmRecycle, onCopy }) => {
    const [open, setOpen] = useState(true);

    return (
      <div className="min-h-screen bg-surface p-8">
        <div className="mb-4">
          <Button onClick={() => setOpen(true)} variant="secondary">
            Open Dialog
          </Button>
        </div>
        <ApiKeyRecycleDialog
          open={open}
          onOpenChange={setOpen}
          newApiKey={newApiKey}
          isRecycling={isRecycling}
          onConfirmRecycle={onConfirmRecycle}
          onCopy={onCopy}
        />
      </div>
    );
  },
};

export const WithNewKey: Story = {
  args: {
    newApiKey: "dk_abc123def456ghi789jkl012mno345pqr678",
    isRecycling: false,
    onConfirmRecycle: () => console.log("Confirm recycle clicked"),
    onCopy: (text: string) => console.log("Copied:", text),
  },
  render: ({ newApiKey, isRecycling, onConfirmRecycle, onCopy }) => {
    const [open, setOpen] = useState(true);

    return (
      <div className="min-h-screen bg-surface p-8">
        <div className="mb-4">
          <Button onClick={() => setOpen(true)} variant="secondary">
            Open Dialog
          </Button>
        </div>
        <ApiKeyRecycleDialog
          open={open}
          onOpenChange={setOpen}
          newApiKey={newApiKey}
          isRecycling={isRecycling}
          onConfirmRecycle={onConfirmRecycle}
          onCopy={onCopy}
        />
      </div>
    );
  },
};

export const Interactive: Story = {
  args: {
    newApiKey: null,
    isRecycling: false,
    onConfirmRecycle: () => {},
    onCopy: (text: string) => navigator.clipboard.writeText(text),
  },
  render: ({ onCopy }) => {
    const [open, setOpen] = useState(true);
    const [isRecycling, setIsRecycling] = useState(false);
    const [newApiKey, setNewApiKey] = useState<string | null>(null);

    const handleConfirmRecycle = () => {
      setIsRecycling(true);
      setTimeout(() => {
        setIsRecycling(false);
        setNewApiKey("dk_abc123def456ghi789jkl012mno345pqr678");
      }, 1500);
    };

    const handleOpenChange = (isOpen: boolean) => {
      setOpen(isOpen);
      if (!isOpen) {
        setNewApiKey(null);
        setIsRecycling(false);
      }
    };

    return (
      <div className="min-h-screen bg-surface p-8">
        <div className="mb-4">
          <Button onClick={() => setOpen(true)} variant="secondary">
            Open Dialog
          </Button>
        </div>
        <ApiKeyRecycleDialog
          open={open}
          onOpenChange={handleOpenChange}
          newApiKey={newApiKey}
          isRecycling={isRecycling}
          onConfirmRecycle={handleConfirmRecycle}
          onCopy={onCopy}
        />
      </div>
    );
  },
};
