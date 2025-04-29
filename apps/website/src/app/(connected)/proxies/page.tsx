import { ProxiesRedirect } from "@/components/proxies/proxies-redirect";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Manage",
};

export default function ProxyIndexPage() {
  return <ProxiesRedirect />;
}
