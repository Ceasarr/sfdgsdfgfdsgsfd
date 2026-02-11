import type { Metadata } from "next";
import { Titan_One } from "next/font/google";
import "./globals.css";

const titanOne = Titan_One({ weight: "400", subsets: ["latin"], variable: "--font-titan-one" });
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import { ToastProvider } from "@/components/ui/toast-context";
import { AuthProvider } from "@/components/ui/auth-context";
import { FlyToCartProvider } from "@/components/fly-to-cart";
import { ReactQueryProvider } from "@/components/providers/react-query-provider";
import { ReCaptchaProvider } from "@/components/recaptcha-provider";

const siteUrl = "https://enotik.net";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Enotik.net — купить Robux и предметы Roblox дёшево",
    template: "%s | Enotik.net",
  },
  description:
    "Купить Robux и виртуальные предметы Roblox по лучшей цене. Мгновенная доставка, безопасная оплата, поддержка 24/7. Товары для Murder Mystery 2, Adopt Me, Blox Fruits, Toilet Tower Defense и других игр.",
  keywords: [
    "купить robux",
    "робуксы",
    "robux дёшево",
    "roblox",
    "виртуальные предметы roblox",
    "murder mystery 2",
    "adopt me",
    "blox fruits",
    "toilet tower defense",
    "grow a garden",
    "enotik",
    "enotik.net",
  ],
  authors: [{ name: "Enotik.net", url: siteUrl }],
  creator: "Enotik.net",
  publisher: "Enotik.net",
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    type: "website",
    locale: "ru_RU",
    url: siteUrl,
    siteName: "Enotik.net",
    title: "Enotik.net — купить Robux и предметы Roblox дёшево",
    description:
      "Покупайте Robux и виртуальные предметы Roblox с мгновенной доставкой. Лучшие цены на робуксы и игровые товары.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Enotik.net — магазин Robux и предметов Roblox",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Enotik.net — купить Robux и предметы Roblox дёшево",
    description:
      "Покупайте Robux и виртуальные предметы Roblox с мгновенной доставкой.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

// JSON-LD Organization structured data
const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Enotik.net",
  url: siteUrl,
  logo: `${siteUrl}/logo.png`,
  description:
    "Интернет-магазин Robux и виртуальных предметов для Roblox. Мгновенная доставка, безопасная оплата.",
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer service",
    availableLanguage: ["Russian"],
  },
};

// JSON-LD WebSite with search action (for Google sitelinks search box)
const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Enotik.net",
  url: siteUrl,
  description: "Магазин Robux и виртуальных предметов Roblox",
  inLanguage: "ru",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body className={titanOne.variable}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <ReactQueryProvider>
          <ToastProvider>
            <AuthProvider>
              <ReCaptchaProvider>
                <FlyToCartProvider>
                  <Navbar />
                  {children}
                  <Footer />
                  {/* Bottom spacer for mobile nav */}
                  <div className="h-16 md:hidden" />
                  <MobileBottomNav />
                </FlyToCartProvider>
              </ReCaptchaProvider>
            </AuthProvider>
          </ToastProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
