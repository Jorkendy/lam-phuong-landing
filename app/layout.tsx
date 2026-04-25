import { ReactNode } from "react";
import type { Metadata, Viewport } from "next";
import "../styles/globals.css";
import Header from "@/app/components/header";
import Footer from "@/app/components/footer";
import ScrollReveal from "@/app/components/scroll-reveal";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://lamphuong.com.vn";
const siteName = "Lam Phương";
const description =
  "Lam Phương cung cấp giải pháp marketing toàn diện cho ngành Game tại Việt Nam: Content Marketing, Creative Production, KOLs/Influencer Booking, PR & Communication, Public Event.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${siteName} – Make it simple. Make it memorable.`,
    template: `%s | ${siteName}`,
  },
  description,
  applicationName: siteName,
  keywords: [
    "Lam Phương",
    "marketing game",
    "content marketing",
    "creative production",
    "KOLs booking",
    "influencer marketing",
    "PR truyền thông",
    "tổ chức sự kiện game",
    "marketing agency Vietnam",
  ],
  authors: [{ name: siteName }],
  creator: siteName,
  publisher: siteName,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "vi_VN",
    url: siteUrl,
    siteName,
    title: `${siteName} – Make it simple. Make it memorable.`,
    description,
    images: [
      {
        url: "/images/banner-page.png",
        width: 1260,
        height: 540,
        alt: siteName,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteName} – Make it simple. Make it memorable.`,
    description,
    images: ["/images/banner-page.png"],
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export const viewport: Viewport = {
  themeColor: "#429da5",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="vi">
      <body>
        <Header />

        {children}

        <Footer />
        <ScrollReveal />
      </body>
    </html>
  );
}
