import type { Client } from "../../../components/types.ts";

export const mockClients: Client[] = [
    {
      id: "claude",
      label: "Claude",
      image: "/icons/claude-icon.png",
      type: "installer",
      installed: true,
      present: true,
    },
    {
      id: "cursor",
      label: "Cursor",
      image: "/icons/cursor-icon.png",
      type: "installer",
      installed: true,
      present: false,
    },
    {
      id: "vscode",
      label: "VSCode",
      image: "/icons/code-icon.png",
      type: "installer",
      installed: true,
      present: false,
    },
    {
      id: "goose",
      label: "Goose",
      image: "/icons/goose-icon.png",
      type: "deep-link",
    },
    {
      id: "raycast",
      label: "Raycast",
      image: "/icons/raycast-icon.png",
      type: "deep-link",
    },
  ];