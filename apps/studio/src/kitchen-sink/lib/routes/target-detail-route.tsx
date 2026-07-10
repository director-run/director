import { LayoutBreadcrumbHeader } from "@director.run/design/components/layout/layout-breadcrumb-header.tsx";
import {
  LayoutView,
  LayoutViewContent,
} from "@director.run/design/components/layout/layout.tsx";
import { McpLogo } from "@director.run/design/components/mcp-logo.tsx";
import { PlaybookTargetPropertyList } from "@director.run/design/components/mcp-servers/playbook-target-property-list.tsx";
import { FullScreenError } from "@director.run/design/components/pages/global/error.tsx";
import { PlaybookSkeleton } from "@director.run/design/components/playbooks/playbook-skeleton.tsx";
import { RegistryEntryReadme } from "@director.run/design/components/registry/registry-entry-readme.tsx";
import { ToolList } from "@director.run/design/components/tools/tool-list.tsx";
import type {
  MCPTool,
  PlaybookDetail,
  PlaybookTarget,
} from "@director.run/design/components/types.ts";
import { Button } from "@director.run/design/components/ui/button.tsx";
import { ConfirmDialog } from "@director.run/design/components/ui/confirm-dialog.tsx";
import { Container } from "@director.run/design/components/ui/container.tsx";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@director.run/design/components/ui/dropdown-menu.tsx";
import { Markdown } from "@director.run/design/components/ui/markdown.tsx";
import {
  MenuItemIcon,
  MenuItemLabel,
} from "@director.run/design/components/ui/menu.tsx";
import {
  Section,
  SectionDescription,
  SectionHeader,
  SectionTitle,
} from "@director.run/design/components/ui/section.tsx";
import { Tab, Tabs } from "@director.run/design/components/ui/tabs.tsx";
import { toast } from "@director.run/design/components/ui/toast.tsx";
import { mockRegistryEntry } from "@director.run/design/test/fixtures/registry/entry.ts";
import {
  BookOpenTextIcon,
  DotsThreeOutlineVerticalIcon,
  HardDriveIcon,
  SignOutIcon,
  ToolboxIcon,
  TrashIcon,
} from "@phosphor-icons/react";
import { useState } from "react";
import type { KitchenSinkNavigate, KitchenSinkPageState } from "../types";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

interface TargetDetailRouteProps {
  playbook: PlaybookDetail;
  target: PlaybookTarget;
  tools: MCPTool[];
  navigate: KitchenSinkNavigate;
  pageState: KitchenSinkPageState;
  onDelete: () => void;
}

export function TargetDetailRoute({
  playbook,
  target,
  tools,
  navigate,
  pageState,
  onDelete,
}: TargetDetailRouteProps) {
  if (pageState === "loading") {
    return <PlaybookSkeleton />;
  }

  if (pageState === "error") {
    return (
      <FullScreenError
        icon="dead-smiley"
        fullScreen={true}
        title="Unexpected Error"
        subtitle="Something went wrong loading this server."
      />
    );
  }

  return (
    <LayoutView>
      <LayoutBreadcrumbHeader
        breadcrumbs={[
          {
            title: playbook.name,
            onClick: () =>
              navigate({ name: "playbook", playbookId: playbook.id }),
          },
          { title: target.name },
        ]}
      >
        <TargetActionsDropdown
          target={target}
          onDelete={onDelete}
          playbookName={playbook.name}
        />
      </LayoutBreadcrumbHeader>

      <LayoutViewContent>
        <Container size="lg">
          <Section className="gap-y-8">
            <McpLogo src={mockRegistryEntry.icon} className="size-9" />
            <SectionHeader>
              <SectionTitle>{target.name}</SectionTitle>
              <SectionDescription>
                Installed on{" "}
                <button
                  type="button"
                  onClick={() =>
                    navigate({ name: "playbook", playbookId: playbook.id })
                  }
                  className="cursor-pointer text-fg underline"
                >
                  {playbook.name}
                </button>
              </SectionDescription>
            </SectionHeader>

            <Markdown>{mockRegistryEntry.description}</Markdown>
          </Section>

          <Tabs default="tools">
            <Tab
              id="readme"
              label="Readme"
              icon={<BookOpenTextIcon />}
              content={
                <RegistryEntryReadme readme={mockRegistryEntry.readme} />
              }
            />
            <Tab
              id="tools"
              label="Tools"
              icon={<ToolboxIcon />}
              content={<ToolList tools={tools} toolsLoading={false} />}
            />
            <Tab
              id="properties"
              label="Properties"
              icon={<HardDriveIcon />}
              content={
                <Section>
                  <SectionHeader>
                    <SectionTitle variant="h2" asChild>
                      <h3>Transport Configuration</h3>
                    </SectionTitle>
                  </SectionHeader>
                  <PlaybookTargetPropertyList target={target} />
                </Section>
              }
            />
          </Tabs>
        </Container>
      </LayoutViewContent>
    </LayoutView>
  );
}

function TargetActionsDropdown({
  target,
  onDelete,
  playbookName,
}: {
  target: PlaybookTarget;
  onDelete: () => void;
  playbookName: string;
}) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);

  const isHttp = target.type === "http";
  const isAuthenticated =
    target.type === "http" && Boolean(target.connectionInfo?.isAuthenticated);

  const handleDelete = async () => {
    await delay(400);
    toast({
      title: "Server deleted",
      description: `${target.name} was removed from ${playbookName}.`,
    });
    setDeleteOpen(false);
    onDelete();
  };

  const handleLogout = async () => {
    await delay(400);
    toast({
      title: "Logged out",
      description: `${target.name} was logged out.`,
    });
    setLogoutOpen(false);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size="icon"
            variant="ghost"
            className="radix-state-[open]:bg-accent-subtle"
          >
            <DotsThreeOutlineVerticalIcon weight="fill" className="!size-4" />
            <span className="sr-only">Server actions</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuGroup>
            {isHttp && isAuthenticated && (
              <DropdownMenuItem onSelect={() => setLogoutOpen(true)}>
                <MenuItemIcon>
                  <SignOutIcon />
                </MenuItemIcon>
                <MenuItemLabel>Logout</MenuItemLabel>
              </DropdownMenuItem>
            )}
            {isHttp && !isAuthenticated && (
              <DropdownMenuItem
                onSelect={async () => {
                  await delay(400);
                  toast({
                    title: "Authenticating",
                    description: `Would start OAuth for ${target.name}.`,
                  });
                }}
              >
                <MenuItemLabel>Authenticate</MenuItemLabel>
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onSelect={() => setDeleteOpen(true)}>
              <MenuItemIcon>
                <TrashIcon />
              </MenuItemIcon>
              <MenuItemLabel>Delete</MenuItemLabel>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      <ConfirmDialog
        title="Delete this server"
        description="Are you sure you want to delete this server? This action cannot be undone."
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={handleDelete}
      />
      <ConfirmDialog
        title="Logout this server"
        description="Are you sure you want to logout this server? This action cannot be undone."
        open={logoutOpen}
        onOpenChange={setLogoutOpen}
        onConfirm={handleLogout}
      />
    </>
  );
}
