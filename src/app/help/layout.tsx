import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Помощь и FAQ",
    description:
        "Ответы на частые вопросы о покупке Robux и виртуальных предметов Roblox. Как оплатить, сроки доставки, возврат средств и поддержка клиентов Enotik.net.",
    alternates: {
        canonical: "https://enotik.net/help",
    },
    openGraph: {
        title: "Помощь и FAQ — Enotik.net",
        description: "Ответы на частые вопросы о покупке Robux и предметов Roblox.",
        url: "https://enotik.net/help",
        siteName: "Enotik.net",
        locale: "ru_RU",
        type: "website",
    },
};

export default function HelpLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
