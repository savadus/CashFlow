import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

import { FinanceProvider } from "@/context/FinanceContext";

export const metadata: Metadata = {
  title: "MVEE.IN CashFlow",
  description: "Industrial Fiscal Ecosystem for Sovereign Money management. Track your institutional liquidity with absolute technical authority.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "MVEE.IN CashFlow",
  },
  icons: {
    icon: "/cash-flow-logo.png",
    apple: "/cash-flow-logo.png",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-screen bg-background text-foreground flex flex-col font-sans">
        <FinanceProvider>
          {children}
        </FinanceProvider>
      </body>
    </html>
  );
}
