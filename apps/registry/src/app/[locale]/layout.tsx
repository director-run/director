import {
  Shell,
  ShellContent,
  ShellHeader,
} from "@director.run/design/components/shell";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata } from "next";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { Inter, JetBrains_Mono } from "next/font/google";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { Providers } from "../../components/providers";
import { routing } from "../../i18n/routing";
import { TRPCProvider } from "../../trpc/client";

import "../globals.css";

const fontSans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  fallback: [
    "ui-sans-serif",
    "system-ui",
    "sans-serif",
    "'Apple Color Emoji'",
    "'Segoe UI Emoji'",
  ],
});

const fontMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  fallback: [
    "ui-monospace",
    "monospace",
    "'Apple Color Emoji'",
    "'Segoe UI Emoji'",
  ],
});

interface RootLayoutProps {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("metadata");

  return {
    title: {
      absolute: t("title"),
      template: `%s | ${t("title")}`,
    },
    description: t("description"),
    robots: {
      index: true,
      follow: true,
    },
    alternates: {
      canonical: "https://director.run",
      languages: {
        en: "https://director.run/en",
      },
    },
    openGraph: {
      title: t("title"),
      description: t("description"),
      url: "https://director.run",
    },
  };
}

export default async function RootLayout({
  children,
  params,
}: RootLayoutProps) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  return (
    <html lang={locale} suppressHydrationWarning>
      <body
        className={`${fontSans.variable} ${fontMono.variable} font-sans antialiased`}
      >
        <NextIntlClientProvider>
          <TRPCProvider>
            <Providers>
              <Shell>
                <ShellHeader>Hello</ShellHeader>
                <ShellContent>{children}</ShellContent>
              </Shell>
            </Providers>
          </TRPCProvider>
        </NextIntlClientProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
