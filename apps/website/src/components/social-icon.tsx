import {
  GithubLogoIcon,
  LinkedinLogoIcon,
  XLogoIcon,
} from "@phosphor-icons/react/ssr";

import { assertUnreachable } from "@/lib/assert-unreachable";
import { SocialType } from "@/site-config";

export function SocialIcon({
  type,
  className,
}: { type: SocialType; className?: string }) {
  switch (type) {
    case "github":
      return <GithubLogoIcon weight="duotone" className={className} />;
    case "linkedin":
      return <LinkedinLogoIcon weight="duotone" className={className} />;
    case "x":
      return <XLogoIcon weight="duotone" className={className} />;
    default:
      assertUnreachable(type);
  }
}
