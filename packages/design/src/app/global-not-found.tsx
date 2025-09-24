"use client";

import { Inter, JetBrains_Mono } from "next/font/google";
import { FullScreenError } from "../components/pages/global/error";

import "./globals.css";

const sans = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const mono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${sans.variable} ${mono.variable} antialiased`}>
        <PleaseUpdate />
      </body>
    </html>
  );
}

function PleaseUpdate() {
  return (
    <FullScreenError
      title={"Please Update Director"}
      fullScreen={true}
      subtitle={
        "This version of the studio is no longer used. Please update the CLI to use the hosted version."
      }
      data={[
        "$ npm install -g @director.run/cli@latest",
        "$ director quickstart",
      ].join("\n")}
    />
  );
}
