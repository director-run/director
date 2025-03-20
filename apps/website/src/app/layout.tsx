import { BASE_URL } from "@/lib/url";
import { TRPCProvider } from "@/trpc/client";
import { Analytics } from "@vercel/analytics/react";
import type { Metadata } from "next";
import localFont from "next/font/local";
import { NuqsAdapter } from "nuqs/adapters/next/app";

import "./globals.css";

const displaySans = localFont({
  src: [
    {
      path: "../../public/fonts/JetBrainsMono[wght].ttf",
      weight: "100 800",
    },
    {
      path: "../../public/fonts/JetBrainsMono-Italic[wght].ttf",
      weight: "100 800",
      style: "italic",
    },
  ],
  fallback: ["ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "Liberation Mono", "Courier New", "monospace"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  metadataBase: new URL(`https://${BASE_URL}`),
  alternates: {
    canonical: "/",
  },
  title: "working.dev",
  description: "Working is a new toolbox for product builders.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={displaySans.variable}>
        <TRPCProvider>
          <NuqsAdapter>{children}</NuqsAdapter>
        </TRPCProvider>
        <Analytics />
      </body>
    </html>
  );
}
