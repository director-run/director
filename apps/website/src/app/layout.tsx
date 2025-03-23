import { BASE_URL } from "@/lib/url";
import { TRPCProvider } from "@/trpc/client";
import { cn } from "@director/ui/lib/cn";
import { Analytics } from "@vercel/analytics/react";
import type { Metadata } from "next";
import localFont from "next/font/local";
import { NuqsAdapter } from "nuqs/adapters/next/app";

import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

const jetBrainsMono = localFont({
  src: [
    {
      path: "../../../../assets/fonts/JetBrainsMono[wght].ttf",
      weight: "100 800",
    },
    {
      path: "../../../../assets/fonts/JetBrainsMono-Italic[wght].ttf",
      weight: "100 800",
      style: "italic",
    },
  ],
  fallback: [
    "ui-monospace",
    "SFMono-Regular",
    "Menlo",
    "Monaco",
    "Consolas",
    "Liberation Mono",
    "Courier New",
    "monospace",
  ],
  variable: "--font-mono",
});

const geistSans = localFont({
  src: [
    {
      path: "../../../../assets/fonts/Geist[wght].ttf",
      weight: "100 900",
    },
  ],
  fallback: [
    "ui-sans-serif",
    "system-ui",
    "-apple-system",
    "BlinkMacSystemFont",
    "Segoe UI",
    "Roboto",
    "Helvetica Neue",
    "Arial",
    "Noto Sans",
    "sans-serif",
    "Apple Color Emoji",
    "Segoe UI Emoji",
    "Segoe UI Symbol",
    "Noto Color Emoji",
  ],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  metadataBase: new URL(`https://${BASE_URL}`),
  alternates: {
    canonical: "/",
  },
  title: "director.run",
  description: "director.run is a new toolbox for product builders.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(jetBrainsMono.variable, geistSans.variable)}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <TRPCProvider>
            <NuqsAdapter>{children}</NuqsAdapter>
          </TRPCProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
