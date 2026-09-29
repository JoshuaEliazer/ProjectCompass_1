import type { Metadata } from "next";
import "./globals.css";
import DashboardLayout from "@/components/shared/DashboardLayout";
//import GoogleAnalytics from "@/components/analytics/GoogleAnalytics";

const geistSans = { variable: "font-sans" };
const geistMono = { variable: "font-mono" };

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
        {/* {process.env.NODE_ENV === "production" && (
          <GoogleAnalytics measurementId="G-555YYV1C6G" />
        )} */}
        <DashboardLayout>{children}</DashboardLayout>
      </body>
    </html>
  );
}
