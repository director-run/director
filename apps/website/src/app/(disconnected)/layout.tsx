import {
  DefaultLayout,
  DefaultLayoutContent,
  DefaultLayoutFooter,
  DefaultLayoutHeader,
} from "@/components/default-layout";

export default function DisconnectedLayout({
  children,
}: { children: React.ReactNode }) {
  return (
    <DefaultLayout>
      <DefaultLayoutHeader />
      <DefaultLayoutContent>{children}</DefaultLayoutContent>
      <DefaultLayoutFooter />
    </DefaultLayout>
  );
}
