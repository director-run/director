import { LayoutRoot } from "@/components/layout";

export default function DefaultLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <LayoutRoot>{children}</LayoutRoot>;
}
