import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Регистрация",
    description: "Создайте аккаунт Enotik.net для покупки Robux и виртуальных предметов Roblox с мгновенной доставкой.",
    robots: {
        index: false,
        follow: false,
    },
};

export default function RegisterLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
