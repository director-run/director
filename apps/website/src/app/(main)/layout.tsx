import { Contents, ContentsItem } from "@/components/contents";
import {
  DefaultLayout,
  DefaultLayoutFooter,
  DefaultLayoutHeader,
} from "@/components/layouts/default-layout";
import { trpc } from "@/trpc/server";

export default async function MainLayout({
  children,
}: { children: React.ReactNode }) {
  const dmg = await trpc.github.dmg();

  return (
    <DefaultLayout>
      <DefaultLayoutHeader>
        <Contents>
          <ContentsItem position={0} href="#introduction">
            Introduction
          </ContentsItem>
          <ContentsItem position={1} href="#get-started">
            Get started
          </ContentsItem>
          <ContentsItem position={2} href="#features">
            Features
          </ContentsItem>
          <ContentsItem
            position={3}
            href="https://github.com/theworkingcompany/director/releases"
          >
            Releases
          </ContentsItem>
        </Contents>
      </DefaultLayoutHeader>
      {children}
      <DefaultLayoutFooter
        sections={[
          {
            title: "Product",
            items: [
              {
                label: "Download for OSX",
                href: dmg.dmg ? dmg.dmg : "https://github.com/download.dmg",
                disabled: !dmg.ok,
              },
              {
                label: "Install CLI",
                href: "/",
              },
              {
                label: "Releases",
                href: "https://github.com/theworkingcompany/director/releases",
              },
            ],
          },
          {
            title: "Social",
            items: [
              {
                label: "X/Twitter",
                href: "https://x.com/theworkingco",
              },
              {
                label: "Github",
                href: "https://github.com/theworkingcompany/director",
              },
            ],
          },
        ]}
      />
    </DefaultLayout>
  );
}
