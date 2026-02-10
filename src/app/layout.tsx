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

export const metadata: Metadata = {
  title: "Enotik.net — покупка Robux и виртуальных предметов",
  description:
    "Покупайте пакеты Robux и виртуальные предметы Roblox мгновенно. Быстрая доставка, безопасная оплата, поддержка 24/7. Лучшие предложения на Robux и премиум‑товары.",
  keywords: ["robux", "roblox", "виртуальные предметы", "игры", "купить robux", "дешёвые robux", "enotik"],
  authors: [{ name: "Enotik.net" }],
  openGraph: {
    title: "Enotik.net — покупка Robux и виртуальных предметов",
    description: "Покупайте Robux и виртуальные предметы Roblox с быстрой доставкой.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body className={titanOne.variable}>
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
