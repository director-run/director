import type { Icon } from "@phosphor-icons/react";
import {
  AppWindowIcon,
  DoorOpenIcon,
  FileTextIcon,
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
    description:
      "Director is a modern, open-source API gateway that allows you to connect your applications to any service.",
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
      href: "https://github.com/theworkingcompany/director",
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
      href: "https://docs.director.run",
      mobile: true,
    },
  ],
  features: [
    {
      title: "Connection hub",
      description:
        "Single endpoint for all clients with multiple backend MCP servers",
      icon: PlugIcon,
    },
    {
      title: "One click clients",
      description: "Install your Director instance with a single click",
      icon: RocketIcon,
    },
    {
      title: "Great discovery",
      description: "Browse and securely install MCP servers from our registry",
      icon: MagnifyingGlassIcon,
    },
    {
      title: "Proxy isolation",
      description: "Prevent cross-contamination with our independent contexts",
      icon: ShieldCheckIcon,
    },
    {
      title: "Audit trails",
      description: "Track all requests and responses to MCP servers",
      icon: FileTextIcon,
    },
    {
      title: "Top notch security",
      description:
        "Secure transports, error isolation, and configurable security settings",
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
        "Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.",
      icon: DoorOpenIcon,
      href: "#todo",
    },
    {
      title: "Studio",
      description:
        "Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.",
      icon: AppWindowIcon,
      href: "#todo",
    },
  ],
  members: [
    {
      image: "https://avatars.githubusercontent.com/u/480673?v=4",
      name: "Barnaby Malet",
      // TODO: add description
      description:
        "Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.",
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
      // TODO: add description
      description:
        "Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.",
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
