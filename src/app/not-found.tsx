import Link from "next/link";

export default function NotFound() {
    return (
        <main className="min-h-screen bg-background flex items-center justify-center px-4">
            <div className="text-center">
                {/* 404 Text */}
                <h1 className="text-9xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent mb-4">
                    404
                </h1>

                {/* Message */}
                <h2 className="text-3xl font-bold mb-4">Страница не найдена</h2>
                <p className="text-muted-foreground mb-8 max-w-md">
                    Извините, мы не смогли найти страницу, которую вы ищете. Возможно, она была перемещена или не существует.
                </p>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link
                        href="/"
                        className="rounded-md bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-3 font-semibold text-white shadow transition-all hover:from-purple-700 hover:to-pink-700"
                    >
                        На главную
                    </Link>
                    <Link
                        href="/account"
                        className="rounded-md border border-border bg-background px-6 py-3 font-medium transition-colors hover:bg-muted"
                    >
                        Мой аккаунт
                    </Link>
                </div>

                {/* Decorative Element */}
                <div className="mt-16 text-6xl opacity-20">🔍</div>
            </div>
        </main>
    );
}
