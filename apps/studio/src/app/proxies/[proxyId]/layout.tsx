import { ProxySelector } from "@/components/proxies/proxy-selector";

export default function ProxyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <ProxySelector />
      {children}
    </div>
  );
}
