import "./fonts.css";
import "./globals.css";
import { ChatToUs } from "@director.run/studio/components/chat-to-us.tsx";
import {
  LayoutRoot,
  LayoutView,
} from "@director.run/studio/components/layout/layout.tsx";
import { useNavigate } from "react-router-dom";

export const Root = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();

  return (
    <LayoutRoot
      sections={[
        {
          id: "links",
          label: "Links",
          items: [
            {
              id: "settings",
              label: "Settings",
              isActive: false,
              onClick: () => navigate("/settings"),
            },
            {
              id: "about",
              label: "About",
              isActive: false,
              onClick: () => navigate("/about"),
            },
            {
              id: "workspace",
              label: "Workspace",
              isActive: false,
              onClick: () => navigate("/workspace"),
            },
          ],
        },
        {
          id: "actions",
          items: [],
        },
      ]}
    >
      <LayoutView>{children}</LayoutView>
      <ChatToUs />
    </LayoutRoot>
  );
};
