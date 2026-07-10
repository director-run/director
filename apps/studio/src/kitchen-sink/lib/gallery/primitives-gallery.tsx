import { McpLogo } from "@director.run/design/components/mcp-logo.tsx";
import { ServerStatusBadge } from "@director.run/design/components/servers/server-status-badge.tsx";
import {
  Badge,
  BadgeGroup,
  BadgeIcon,
  BadgeLabel,
} from "@director.run/design/components/ui/badge.tsx";
import { Button } from "@director.run/design/components/ui/button.tsx";
import { Logo } from "@director.run/design/components/ui/icons/logo.tsx";
import { MCPIcon } from "@director.run/design/components/ui/icons/mcp-icon.tsx";
import { Input } from "@director.run/design/components/ui/input.tsx";
import { Label } from "@director.run/design/components/ui/label.tsx";
import { Loader } from "@director.run/design/components/ui/loader.tsx";
import { ScrambleText } from "@director.run/design/components/ui/scramble-text.tsx";
import { SelectNative } from "@director.run/design/components/ui/select-native.tsx";
import { Separator } from "@director.run/design/components/ui/separator.tsx";
import { Switch } from "@director.run/design/components/ui/switch.tsx";
import { Textarea } from "@director.run/design/components/ui/textarea.tsx";
import { textVariants } from "@director.run/design/components/ui/typography.tsx";
import {
  ArrowRightIcon,
  CheckCircleIcon,
  PlusIcon,
  SealCheckIcon,
} from "@phosphor-icons/react";
import { kitchenSinkPlaybooks } from "../fixtures";
import { GalleryRow, GallerySection } from "./gallery-section";

const BUTTON_VARIANTS = ["default", "secondary", "inverse", "ghost"] as const;
const BUTTON_SIZES = ["sm", "default", "lg"] as const;

const statusServers = kitchenSinkPlaybooks()
  .flatMap((playbook) => playbook.servers)
  .filter(
    (server, index, all) =>
      all.findIndex(
        (candidate) =>
          candidate.connectionInfo?.status === server.connectionInfo?.status,
      ) === index,
  );

export function PrimitivesGallery() {
  return (
    <div className="flex flex-col gap-y-12">
      <GallerySection
        title="Buttons"
        description="Variants, sizes, icons and disabled state."
      >
        {BUTTON_VARIANTS.map((variant) => (
          <GalleryRow key={variant} label={variant}>
            {BUTTON_SIZES.map((size) => (
              <Button key={size} variant={variant} size={size}>
                {size}
              </Button>
            ))}
            <Button variant={variant} size="icon">
              <PlusIcon />
            </Button>
            <Button variant={variant} disabled>
              disabled
            </Button>
          </GalleryRow>
        ))}
        <GalleryRow label="with icon / as link">
          <Button>
            <PlusIcon />
            Add server
          </Button>
          <Button variant="secondary">
            Continue
            <ArrowRightIcon />
          </Button>
          <Button asChild>
            <a href="/">Anchor button</a>
          </Button>
        </GalleryRow>
      </GallerySection>

      <GallerySection
        title="Badges"
        description="Status labels, with variants, icons and uppercase labels."
      >
        <GalleryRow label="variants">
          <Badge>
            <BadgeLabel>Default</BadgeLabel>
          </Badge>
          <Badge variant="success">
            <BadgeLabel>Success</BadgeLabel>
          </Badge>
          <Badge variant="destructive">
            <BadgeLabel>Destructive</BadgeLabel>
          </Badge>
        </GalleryRow>
        <GalleryRow label="with icon / uppercase">
          <Badge variant="success">
            <BadgeIcon>
              <SealCheckIcon />
            </BadgeIcon>
            <BadgeLabel uppercase>Official</BadgeLabel>
          </Badge>
          <Badge>
            <BadgeIcon>
              <CheckCircleIcon />
            </BadgeIcon>
            <BadgeLabel>Verified</BadgeLabel>
          </Badge>
        </GalleryRow>
        <GalleryRow label="server status badge">
          <BadgeGroup>
            {statusServers.map((server) => (
              <ServerStatusBadge key={server.name} server={server} />
            ))}
          </BadgeGroup>
        </GalleryRow>
      </GallerySection>

      <GallerySection
        title="Typography"
        description="The text scale exposed through textVariants."
      >
        <div className="flex flex-col gap-y-2">
          <span className={textVariants({ variant: "h1" })}>Heading 1</span>
          <span className={textVariants({ variant: "h2" })}>Heading 2</span>
          <span className={textVariants({ variant: "h3" })}>Heading 3</span>
          <span className={textVariants({ variant: "h4" })}>Heading 4</span>
          <span className={textVariants({ variant: "p" })}>
            Body paragraph text used throughout the product.
          </span>
          <a className={textVariants({ variant: "inlineLink" })} href="/">
            Inline link
          </a>
        </div>
      </GallerySection>

      <GallerySection
        title="Form controls"
        description="Bare inputs (see the Forms gallery for validated fields)."
      >
        <div className="flex max-w-md flex-col gap-y-4">
          <div className="flex flex-col gap-y-1.5">
            <Label htmlFor="gallery-input">Text input</Label>
            <Input id="gallery-input" placeholder="Type here…" />
          </div>
          <Input defaultValue="With a value" />
          <Input disabled placeholder="Disabled" />
          <Textarea placeholder="Textarea…" />
          <SelectNative defaultValue="http">
            <option value="http">HTTP</option>
            <option value="stdio">STDIO</option>
          </SelectNative>
          <GalleryRow label="switch">
            <Switch defaultChecked />
            <Switch />
            <Switch defaultChecked disabled />
            <Switch disabled />
          </GalleryRow>
          <Separator />
        </div>
      </GallerySection>

      <GallerySection
        title="Feedback & icons"
        description="Loading indicators and brand marks."
      >
        <GalleryRow label="loaders">
          <Loader />
          <ScrambleText text="Loading" />
        </GalleryRow>
        <GalleryRow label="icons">
          <Logo className="size-6" />
          <MCPIcon />
          <McpLogo src="/assets/github.svg" className="size-8" />
          <McpLogo className="size-8" />
        </GalleryRow>
      </GallerySection>
    </div>
  );
}
