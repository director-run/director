import {
  ArrowsClockwiseIcon,
  CheckIcon,
  CopyIcon,
} from "@phosphor-icons/react";
import { useState } from "react";
import type {} from "../types";
import { Badge, BadgeLabel } from "../ui/badge";
import { Button } from "../ui/button";
import { Container } from "../ui/container";
import {} from "../ui/empty-state";
import { Input } from "../ui/input";
import {
  List,
  ListItem,
  ListItemDescription,
  ListItemDetails,
  ListItemTitle,
} from "../ui/list";
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
    isCreatingApiKey,
    onCreateApiKey,
    onRecycleApiKey,
    onClearNewApiKey,
  } = props;

  const [copied, setCopied] = useState(false);

  const handleCopyApiKey = async () => {
    if (newApiKey) {
      await navigator.clipboard.writeText(newApiKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCreateOrRecycle = () => {
    if (apiKey) {
      onRecycleApiKey();
    } else {
      onCreateApiKey();
    }
  };

  return (
    <Container size="lg">
      <Section>
        <SectionHeader>
          <SectionTitle variant="h2" asChild>
            <h3>API Key</h3>
          </SectionTitle>
        </SectionHeader>

        {newApiKey ? (
          <div className="flex flex-col gap-3">
            <p className="text-fg-subtle text-sm">
              Copy your API key now. You won't be able to see it again.
            </p>
            <div className="flex items-center gap-2">
              <Input
                type="text"
                value={newApiKey}
                readOnly
                className="font-mono text-sm"
              />
              <Button
                size="sm"
                variant="secondary"
                onClick={handleCopyApiKey}
                className="shrink-0"
              >
                {copied ? <CheckIcon /> : <CopyIcon />}
              </Button>
            </div>
            <Button
              size="sm"
              variant="secondary"
              onClick={onClearNewApiKey}
              className="self-start"
            >
              Done
            </Button>
          </div>
        ) : isLoadingApiKey ? (
          <p className="text-fg-subtle text-sm">Loading...</p>
        ) : apiKey ? (
          <List>
            <ListItem>
              <ListItemDetails>
                <ListItemTitle className="font-mono">
                  {apiKey.keyPrefix}...
                </ListItemTitle>
                <ListItemDescription>
                  Created {new Date(apiKey.createdAt).toLocaleDateString()}
                  {apiKey.lastUsedAt &&
                    ` · Last used ${new Date(apiKey.lastUsedAt).toLocaleDateString()}`}
                </ListItemDescription>
              </ListItemDetails>
              <Button
                size="sm"
                variant="secondary"
                onClick={handleCreateOrRecycle}
                disabled={isCreatingApiKey}
                className="ml-auto shrink-0"
              >
                <ArrowsClockwiseIcon />
                Recycle
              </Button>
            </ListItem>
          </List>
        ) : (
          <div className="flex flex-col gap-3">
            <p className="text-fg-subtle text-sm">
              You don't have an API key yet. Create one to authenticate MCP
              connections.
            </p>
            <Button
              size="sm"
              onClick={handleCreateOrRecycle}
              disabled={isCreatingApiKey}
              className="self-start"
            >
              {isCreatingApiKey ? "Creating..." : "Create API Key"}
            </Button>
          </div>
        )}
      </Section>

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
        </List>
      </Section>

      <Button size="default" onClick={onClickLogout}>
        Logout
      </Button>
    </Container>
  );
}

type Props = {
  settings: Record<string, string>;
  onClickLogout: () => Promise<void> | void;
  apiKey: ApiKeyData;
  newApiKey: string | null;
  isLoadingApiKey: boolean;
  isCreatingApiKey: boolean;
  onCreateApiKey: () => void;
  onRecycleApiKey: () => void;
  onClearNewApiKey: () => void;
};
