import type {} from "../types";
import { Badge, BadgeLabel } from "../ui/badge";
import { Button } from "../ui/button";
import { Container } from "../ui/container";
import {} from "../ui/empty-state";
import { List, ListItem, ListItemDetails, ListItemTitle } from "../ui/list";
import { Section, SectionHeader, SectionTitle } from "../ui/section";

export function SettingsPage(props: Props) {
  const { settings, onClickLogout } = props;

  return (
    <Container size="lg">
      <Section>
        <SectionHeader>
          <SectionTitle variant="h2" asChild>
            <h3>Settings</h3>
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
};
