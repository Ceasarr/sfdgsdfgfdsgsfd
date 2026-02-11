import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Купить Robux дёшево",
    description:
        "Купить робуксы (Robux) по лучшей цене с мгновенной доставкой. Пополнение через цифровой код или геймпасс. Безопасная оплата, моментальное зачисление на аккаунт Roblox.",
    keywords: [
        "купить робуксы",
        "robux дёшево",
        "купить robux",
        "робуксы дёшево",
        "пополнить robux",
        "robux roblox",
        "робуксы цифровой код",
        "робуксы геймпасс",
        "roblox пополнение",
    ],
    alternates: {
        canonical: "https://enotik.net/robux",
    },
    openGraph: {
        title: "Купить Robux дёшево — Enotik.net",
        description:
            "Робуксы по лучшей цене. Цифровой код или геймпасс. Мгновенная доставка на аккаунт Roblox.",
        url: "https://enotik.net/robux",
        siteName: "Enotik.net",
        locale: "ru_RU",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Купить Robux дёшево — Enotik.net",
        description:
            "Робуксы по лучшей цене. Мгновенная доставка на аккаунт Roblox.",
    },
};

export default function RobuxLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
