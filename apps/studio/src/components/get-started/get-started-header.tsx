"use client";

import { Logo } from "../ui/icons/logo";
import { SectionDescription, SectionHeader, SectionTitle } from "../ui/section";

interface GetStartedHeaderProps {
  title?: string;
  description?: string;
}

export function GetStartedHeader({
  title = "Get started",
  description = "Let's get your started with MCP using Director.",
}: GetStartedHeaderProps) {
  return (
    <>
      <Logo className="mx-auto" />
      <SectionHeader className="items-center gap-y-1.5 text-center">
        <SectionTitle className="font-medium text-2xl">{title}</SectionTitle>
        <SectionDescription className="text-base">
          {description}
        </SectionDescription>
      </SectionHeader>
    </>
  );
}
