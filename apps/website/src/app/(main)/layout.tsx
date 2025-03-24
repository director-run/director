import {
  DefaultLayout,
  DefaultLayoutFooter,
  DefaultLayoutHeader,
} from "@/components/layouts/default-layout";

export default function MainLayout({
  children,
}: { children: React.ReactNode }) {
  return (
    <DefaultLayout>
      <DefaultLayoutHeader />
      {children}
      <DefaultLayoutFooter
        sections={[
          {
            title: "Product",
            items: [
              {
                label: "Download for OSX",
                href: "https://github.com/download.dmg",
              },
              {
                label: "Install CLI",
                href: "/",
              },
              {
                label: "Releases",
                href: "/",
              },
            ],
          },
          {
            title: "Developers",
            items: [
              {
                label: "Docs",
                href: "/",
              },
              {
                label: "Guides",
                href: "/",
              },
              {
                label: "Github",
                href: "https://director.run",
              },
            ],
          },
          {
            title: "Team",
            items: [
              {
                label: "Manifesto",
                href: "/",
              },
              {
                label: "Privacy Policy",
                href: "/",
              },
              {
                label: "Terms of Service",
                href: "/",
              },
            ],
          },
          {
            title: "Social",
            items: [
              {
                label: "X/Twitter",
                href: "https://director.run",
              },
              {
                label: "Github",
                href: "https://director.run",
              },
              {
                label: "Discord",
                href: "https://director.run",
              },
            ],
          },
        ]}
      />
    </DefaultLayout>
  );
}
