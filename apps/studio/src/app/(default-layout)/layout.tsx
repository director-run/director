import { LayoutRoot } from "@/components/layout/layout";

export default function DefaultLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <LayoutRoot>{children}</LayoutRoot>;
}
