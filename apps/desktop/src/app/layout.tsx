import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { GlobalLayout } from "@/components/global-layout";
import { LoadingView } from "@/components/loading-view";
import { AppProvider } from "@/components/providers/app-provider";
import { ProxyContextProvider } from "@/components/proxy/proxy-context";
import { Suspense } from "react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Director",
  robots: {
    index: false,
    follow: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AppProvider>
          <Suspense fallback={<LoadingView />}>
            <ProxyContextProvider>
              <GlobalLayout>{children}</GlobalLayout>
            </ProxyContextProvider>
          </Suspense>
        </AppProvider>
      </body>
    </html>
  );
}
