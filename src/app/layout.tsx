import type { Metadata } from "next";
import "./globals.css";
import "../styles/scrollbar.css";
import { NotificationProvider } from "@/components/ui/Notification";
import { UnifiedTemplateProvider } from "@/contexts/UnifiedTemplateContext";

export const metadata: Metadata = {
  title: "Loan Officer Platform",
  description: "Professional loan management platform",
  icons: {
    icon: [
      { url: "/favicon.png", type: "image/png", sizes: "32x32" },
      { url: "/favicon.png", type: "image/png", sizes: "192x192" },
    ],
    apple: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <body
        className="antialiased"
        suppressHydrationWarning
      >
        <NotificationProvider>
          <UnifiedTemplateProvider>
            {children}
          </UnifiedTemplateProvider>
        </NotificationProvider>
      </body>
    </html>
  );
}
