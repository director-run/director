import type { Icon } from "@phosphor-icons/react";
import {
  AppWindowIcon,
  DoorOpenIcon,
  FileTextIcon,
  ListMagnifyingGlassIcon,
  LockIcon,
  MagnifyingGlassIcon,
  PlugIcon,
  RocketIcon,
  ShieldCheckIcon,
} from "@phosphor-icons/react/ssr";
import type { Metadata } from "next";
import type { StaticImageData } from "next/image";
import { ButtonVariants } from "./components/ui/button";

export type SocialType = "github" | "linkedin" | "x";

export interface SocialProfile {
  type: SocialType;
  url: string;
}

export interface SiteNavigation {
  variant: ButtonVariants["variant"];
  label: string;
  href: string;
  mobile: boolean;
}

export interface SiteConfigRepo {
  title: string;
  description: string;
  icon: Icon;
  href: string;
}

export interface SiteConfigFeature {
  title: string;
  description: string;
  icon: Icon;
}

export interface SiteConfigMember {
  name: string;
  description: string;
  links: SocialProfile[];
  image: string | StaticImageData;
}

export interface SiteConfig {
  metadata: Metadata;
  navigation: SiteNavigation[];
  profiles: SocialProfile[];
  repos: SiteConfigRepo[];
  features: SiteConfigFeature[];
  members: SiteConfigMember[];
}

export const siteConfig: SiteConfig = {
  metadata: {
    title: { absolute: "Director", template: "%s | Director" },
    description: "An open source middleware for MCP that just works.",
    keywords: ["director", "api", "gateway", "mcp", "server", "registry"],
    robots: {
      index: true,
      follow: true,
    },
  },
  navigation: [
    {
      variant: "ghost",
      label: "Github",
      href: "https://github.com/director-run/director",
      mobile: false,
    },
    {
      variant: "ghost",
      label: "Studio",
      href: "https://studio.director.run",
      mobile: false,
    },
    {
      variant: "secondary",
      label: "Documentation",
      href: "https://docs.director.run",
      mobile: false,
    },
    {
      variant: "primary",
      label: "Get started",
      href: "/#try-it-now",
      mobile: true,
    },
  ],
  features: [
    {
      title: "Complete transparency",
      description:
        "Director is fully open source under the MIT license, giving you complete visibility and control.",
      icon: PlugIcon,
    },
    {
      title: "Centralized hub",
      description:
        "Connect all clients through a single endpoint while managing multiple backend MCP servers",
      icon: RocketIcon,
    },
    {
      title: "Easy setup & discovery",
      description:
        "Get started, browse and securely install MCP servers from our registry in minutes",
      icon: MagnifyingGlassIcon,
    },
    {
      title: "VM isolation",
      description:
        "Sandbox MCP servers within a VM or Docker container to protect against remote code injection attacks",
      icon: ShieldCheckIcon,
    },
    {
      title: "Detailed observability",
      description:
        "Track all MCP calls with detailed JSON logging. Monitor tool usage and success rates in real-time",
      icon: FileTextIcon,
    },
    {
      title: "Flexible deployment",
      description:
        "Install and run locally in minutes with one line. Deploy in the cloud using Docker or npm on any *nix server",
      icon: LockIcon,
    },
  ],
  profiles: [
    { type: "github", url: "https://github.com/theworkingcompany" },
    { type: "x", url: "https://x.com/theworkingco" },
  ],
  repos: [
    {
      title: "Gateway",
      description:
        "A local-first proxy that connects your models to any MCP server through a unified integration point.",
      icon: DoorOpenIcon,
      href: "https://github.com/director-run/director/tree/main/packages/gateway/README.md",
    },
    {
      title: "Studio",
      description:
        "A web interface for managing proxies, MCP servers, and connections with ease.",
      icon: AppWindowIcon,
      href: "https://github.com/director-run/director/blob/main/apps/studio/README.md",
    },
    {
      title: "Registry",
      description:
        "A secure directory for discovering, browsing, and installing MCP servers into your environment.",
      icon: ListMagnifyingGlassIcon,
      href: "https://github.com/director-run/director/blob/main/apps/registry/README.md",
    },
  ],
  members: [
    {
      image: "https://avatars.githubusercontent.com/u/480673?v=4",
      name: "Barnaby Malet",
      // TODO: add description
      description:
        "Product engineer, occasional manager. Co-founded Upflow (YCW20). Likes to build things.",
      links: [
        { type: "github", url: "https://github.com/barnaby" },
        {
          type: "linkedin",
          url: "https://www.linkedin.com/in/barnabymalet/",
        },
        { type: "x", url: "https://x.com/barnabymalet" },
      ],
    },
    {
      image: "https://avatars.githubusercontent.com/u/937180?v=4",
      name: "Tom Bates",
      description:
        "Designer/Engineer. Co-founded Duffel (YCS18). Previously at Palantir, GoCardless, and more.",
      links: [
        { type: "github", url: "https://github.com/yoamomonstruos" },
        {
          type: "linkedin",
          url: "https://www.linkedin.com/in/thomas-bates-3908a74b/",
        },
        { type: "x", url: "https://x.com/yoamomonstruos" },
      ],
    },
  ],
};
