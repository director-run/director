import {
  Badge,
  BadgeGroup,
  BadgeIcon,
  BadgeLabel,
} from "@director.run/design/components/ui/badge.tsx";
import {
  CheckCircleIcon,
  InfoIcon,
  WarningCircleIcon,
} from "@phosphor-icons/react";
import type { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "ui/Badge",
  component: Badge,
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AllStates: Story = {
  render: () => (
    <div className="flex flex-col items-start gap-8 p-8">
      <div className="flex flex-col gap-4">
        <h2 className="font-bold text-xl">Badge Variants</h2>
        <BadgeGroup>
          <Badge>
            <BadgeLabel>default</BadgeLabel>
          </Badge>
          <Badge variant="success">
            <BadgeLabel>success</BadgeLabel>
          </Badge>
          <Badge variant="destructive">
            <BadgeLabel>destructive</BadgeLabel>
          </Badge>
        </BadgeGroup>
        <h3 className="mt-2 font-medium text-sm">Uppercase labels</h3>
        <BadgeGroup>
          <Badge>
            <BadgeLabel uppercase>default</BadgeLabel>
          </Badge>
          <Badge variant="success">
            <BadgeLabel uppercase>success</BadgeLabel>
          </Badge>
          <Badge variant="destructive">
            <BadgeLabel uppercase>destructive</BadgeLabel>
          </Badge>
        </BadgeGroup>
      </div>

      <div className="flex flex-col gap-4">
        <h2 className="font-bold text-xl">Badges with Icons</h2>
        <BadgeGroup>
          <Badge>
            <BadgeIcon>
              <InfoIcon />
            </BadgeIcon>
            <BadgeLabel>info</BadgeLabel>
          </Badge>
          <Badge variant="success">
            <BadgeIcon>
              <CheckCircleIcon />
            </BadgeIcon>
            <BadgeLabel>success</BadgeLabel>
          </Badge>
          <Badge variant="destructive">
            <BadgeIcon>
              <WarningCircleIcon />
            </BadgeIcon>
            <BadgeLabel>destructive</BadgeLabel>
          </Badge>
        </BadgeGroup>
      </div>
    </div>
  ),
};
