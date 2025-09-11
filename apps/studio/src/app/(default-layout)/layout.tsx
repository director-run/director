import { LayoutMain } from "@/components/layout";

export default function DefaultLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <LayoutMain>{children}</LayoutMain>;
}
