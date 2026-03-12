import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { HeaderWrapper } from "@/components/layout/HeaderWrapper";
import { Footer } from "@/components/layout/Footer";
import { BottomNav } from "@/components/layout/BottomNav";
import { ServiceWorkerRegistration } from "@/components/layout/ServiceWorkerRegistration";
import { InstallBanner } from "@/components/layout/InstallBanner";
import { ScrollToTop } from "@/components/ui/ScrollToTop";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "RateMyHospital - Nurse Employment Reviews",
  description: "Anonymous workplace reviews for nurses in Southern California.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "RateMyHospital",
  },
  icons: {
    apple: "/icons/icon-192x192.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#0d9488",
};

// Root layout wrapping all pages with shared UI
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ServiceWorkerRegistration />
        <div className="flex min-h-screen flex-col">
          <HeaderWrapper>
            <Header />
          </HeaderWrapper>
          <InstallBanner />
          <main className="flex-1 pb-16 md:pb-0">{children}</main>
          <Footer />
          <BottomNav />
          <ScrollToTop />
        </div>
      </body>
    </html>
  );
}
