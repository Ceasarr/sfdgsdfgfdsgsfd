import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Вход в аккаунт",
    description: "Войдите в свой аккаунт Enotik.net для покупки Robux и виртуальных предметов Roblox.",
    robots: {
        index: false,
        follow: false,
    },
};

export default function LoginLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
