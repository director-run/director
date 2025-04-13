import { AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plus } from "@phosphor-icons/react";

export const INTEGRATION_CONTENT = {
  claude: {
    name: "Claude",
    title: "Usage with Claude",
    description: "Claude is a powerful AI that can help you with your work.",
    avatarContent: <AvatarImage src={"/integrations/claude.png"} />,
    children: undefined,
  },
  cursor: {
    name: "Cursor",
    title: "Usage with Cursor",
    description: "Cursor is a powerful AI that can help you with your work.",
    avatarContent: <AvatarImage src={"/integrations/cursor.jpg"} />,
    children: undefined,
  },
  manual: {
    name: "Manual",
    title: "Manual usage",
    description: "Manual is a powerful AI that can help you with your work.",
    avatarContent: (
      <AvatarFallback>
        <Plus className="size-4 text-muted-foreground" />
      </AvatarFallback>
    ),
    children: (
      <div>This is going to be some instructions on how to use this thing</div>
    ),
  },
} as const;
