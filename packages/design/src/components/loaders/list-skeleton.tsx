import { Badge, BadgeGroup, BadgeLabel } from "../ui/badge";
import * as List from "../ui/list";
import { ScrambleText } from "../ui/scramble-text";

export function ListSkeleton() {
  return (
    <div className="flex flex-col border-accent border-y-[0.5px] opacity-50">
      {new Array(3).fill(0).map((_, index) => (
        <ListSkeletonItem key={`loading-${index}`} />
      ))}
    </div>
  );
}

function ListSkeletonItem() {
  return (
    <List.ListItem>
      <List.ListItemDetails>
        <List.ListItemTitle>
          <ScrambleText text="Loading title" />
        </List.ListItemTitle>
        <List.ListItemDescription>
          <ScrambleText text="Loading subtitle" />
        </List.ListItemDescription>
      </List.ListItemDetails>

      <BadgeGroup>
        <Badge>
          <BadgeLabel>
            <ScrambleText text="Loading badge" />
          </BadgeLabel>
        </Badge>
      </BadgeGroup>
    </List.ListItem>
  );
}
