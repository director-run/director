import { ArrowsClockwiseIcon } from "@phosphor-icons/react";
import { useState } from "react";
import { ApiKeyRecycleDialog } from "../settings/api-key-recycle-dialog";
import { Badge, BadgeGroup, BadgeLabel } from "../ui/badge";
import { Button } from "../ui/button";
import { Container } from "../ui/container";
import { List, ListItem, ListItemDetails, ListItemTitle } from "../ui/list";
import { Section, SectionHeader, SectionTitle } from "../ui/section";

type ApiKeyData = {
  id: string;
  keyPrefix: string;
  createdAt: string;
  lastUsedAt: string | null;
} | null;

export function SettingsPage(props: Props) {
  const {
    settings,
    onClickLogout,
    apiKey,
    newApiKey,
    isLoadingApiKey,
    isRecyclingApiKey,
    onCreateApiKey,
    onRecycleApiKey,
    onClearNewApiKey,
    onCopyApiKey,
  } = props;

  const [recycleDialogOpen, setRecycleDialogOpen] = useState(false);

  const handleRecycleClick = () => {
    setRecycleDialogOpen(true);
  };

  const handleConfirmRecycle = () => {
    onRecycleApiKey();
  };

  const handleDialogOpenChange = (open: boolean) => {
    setRecycleDialogOpen(open);
    if (!open) {
      onClearNewApiKey();
    }
  };

  return (
    <Container size="lg">
      <Section>
        <SectionHeader>
          <SectionTitle variant="h2" asChild>
            <h3>Account</h3>
          </SectionTitle>
        </SectionHeader>

        <List>
          {Object.entries(settings).map(([key, value]) => (
            <ListItem key={key}>
              <ListItemDetails>
                <ListItemTitle>{key}</ListItemTitle>
              </ListItemDetails>
              <Badge className="ml-auto">
                <BadgeLabel>{value}</BadgeLabel>
              </Badge>
            </ListItem>
          ))}

          <ListItem>
            <ListItemDetails>
              <ListItemTitle>API Key</ListItemTitle>
            </ListItemDetails>
            <BadgeGroup className="ml-auto">
              {isLoadingApiKey ? (
                <span className="ml-auto text-fg-subtle text-sm">
                  Loading...
                </span>
              ) : apiKey ? (
                <>
                  <Badge className="ml-auto">
                    <BadgeLabel className="font-mono">
                      {apiKey.keyPrefix}...
                    </BadgeLabel>
                  </Badge>
                  <Button
                    size="icon"
                    variant="secondary"
                    onClick={handleRecycleClick}
                  >
                    <ArrowsClockwiseIcon />
                  </Button>
                </>
              ) : (
                <Button
                  size="sm"
                  variant="inverse"
                  onClick={onCreateApiKey}
                  disabled={isRecyclingApiKey}
                >
                  {isRecyclingApiKey ? "Creating..." : "Create"}
                </Button>
              )}
            </BadgeGroup>
          </ListItem>
        </List>
      </Section>

      <Button size="default" onClick={onClickLogout}>
        Logout
      </Button>

      <ApiKeyRecycleDialog
        open={recycleDialogOpen}
        onOpenChange={handleDialogOpenChange}
        newApiKey={newApiKey}
        isRecycling={isRecyclingApiKey}
        onConfirmRecycle={handleConfirmRecycle}
        onCopy={onCopyApiKey}
      />
    </Container>
  );
}

type Props = {
  settings: Record<string, string>;
  onClickLogout: () => Promise<void> | void;
  apiKey: ApiKeyData;
  newApiKey: string | null;
  isLoadingApiKey: boolean;
  isRecyclingApiKey: boolean;
  onCreateApiKey: () => void;
  onRecycleApiKey: () => void;
  onClearNewApiKey: () => void;
  onCopyApiKey: (text: string) => void;
};
