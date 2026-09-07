import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import DashboardLayout from "@/components/shared/DashboardLayout";
//import GoogleAnalytics from "@/components/analytics/GoogleAnalytics";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Project Compass - AI Dashboard",
  description: "AI-powered AST code mapping & software walkthrough guides",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable}`}
      data-theme="dark"
    >
      <body>
        {process.env.NODE_ENV === "production" && (
          <GoogleAnalytics measurementId="G-555YYV1C6G" />
        )}
        <DashboardLayout>{children}</DashboardLayout>
      </body>
    </html>
  );
}
