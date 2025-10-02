import type { Client } from "../../../components/types.ts";

export const mockClients: Client[] = [
  {
    id: "claude",
    label: "Claude",
    image: "/icons/claude-icon.png",
    installed: true,
    present: true,
  },
  {
    id: "cursor",
    label: "Cursor",
    image: "/icons/cursor-icon.png",
    installed: true,
    present: false,
  },
  {
    id: "vscode",
    label: "VSCode",
    image: "/icons/code-icon.png",
    installed: true,
    present: false,
  },
];
