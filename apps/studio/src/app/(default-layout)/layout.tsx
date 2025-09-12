"use client";

import { LayoutRoot } from "@/components/layout/layout";
import { trpc } from "@/state/client";
import { useRouter } from "next/navigation";

export default function DefaultLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const { data: servers, isLoading, error } = trpc.store.getAll.useQuery();

  const handleLibraryClick = () => {
    router.push("/library");
  };

  const handleServerClick = (serverId: string) => {
    router.push(`/${serverId}`);
  };

  const handleNewServerClick = () => {
    router.push("/new");
  };

  const handleDocumentationClick = () => {
    window.open("https://docs.director.run", "_blank", "noopener noreferrer");
  };

  const handleGithubClick = () => {
    window.open(
      "https://github.com/director-run/director",
      "_blank",
      "noopener noreferrer",
    );
  };

  return (
    <LayoutRoot
      servers={servers}
      isLoading={isLoading}
      error={error?.message}
      onLibraryClick={handleLibraryClick}
      onServerClick={handleServerClick}
      onNewServerClick={handleNewServerClick}
      onDocumentationClick={handleDocumentationClick}
      onGithubClick={handleGithubClick}
    >
      {children}
    </LayoutRoot>
  );
}
