import { ChatToUs } from "@director.run/studio/components/chat-to-us.tsx";
import {
  LayoutRoot,
  LayoutView,
  LayoutViewContent,
  LayoutViewHeader,
} from "@director.run/studio/components/layout/layout.tsx";
import type { NavigationSection } from "@director.run/studio/components/layout/navigation.js";
import { Breadcrumb } from "@director.run/studio/components/ui/breadcrumb.tsx";
import { BreadcrumbList } from "@director.run/studio/components/ui/breadcrumb.tsx";
import { BreadcrumbItem } from "@director.run/studio/components/ui/breadcrumb.tsx";
import { BreadcrumbLink } from "@director.run/studio/components/ui/breadcrumb.tsx";
import { BreadcrumbSeparator } from "@director.run/studio/components/ui/breadcrumb.tsx";
import { BreadcrumbPage } from "@director.run/studio/components/ui/breadcrumb.tsx";
import { MCPIcon } from "@director.run/studio/components/ui/icons/mcp-icon.js";
import {
  BookOpenTextIcon,
  GithubLogoIcon,
  PlusIcon,
} from "@phosphor-icons/react";
import type { Decorator } from "@storybook/react";

export const withLayoutView: Decorator = (Story) => {
  return (
    <LayoutRoot sections={navigationSections}>
      <LayoutView>
        <LayoutViewHeader>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink
                  onClick={() => alert("Library")}
                  className="cursor-pointer"
                >
                  Dummy
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Content</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </LayoutViewHeader>

        <LayoutViewContent>
          <Story />
        </LayoutViewContent>
      </LayoutView>
      <ChatToUs />
    </LayoutRoot>
  );
};

export const navigationSections: NavigationSection[] = [
  {
    id: "library",
    label: "Library",
    items: [
      {
        id: "mcp",
        label: "MCP",
        icon: <MCPIcon />,
        isActive: false,
        onClick: () => alert("MCP"),
      },
    ],
  },
  {
    id: "servers",
    label: "Servers",
    items: [
      {
        id: "dummy-1",
        label: "Dummy 1",
        isActive: false,
        onClick: () => alert("Dummy 1"),
      },
    ],
  },
  {
    id: "actions",
    items: [
      {
        id: "new-server",
        label: "New server",
        icon: <PlusIcon />,
        onClick: () => alert("New server"),
      },
      {
        id: "documentation",
        label: "Documentation",
        icon: <BookOpenTextIcon weight="fill" />,
        onClick: () =>
          window.open(
            "https://docs.director.run",
            "_blank",
            "noopener noreferrer",
          ),
      },
      {
        id: "github",
        label: "Github",
        icon: <GithubLogoIcon />,
        onClick: () =>
          window.open(
            "https://github.com/director-run/director",
            "_blank",
            "noopener noreferrer",
          ),
      },
    ],
  },
];
