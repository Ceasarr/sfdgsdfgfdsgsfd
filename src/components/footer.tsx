import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border/40 bg-background/80 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-8 sm:py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="space-y-3">
            <Link href="/" className="inline-flex items-center group">
              <span className="text-base font-bold tracking-tight bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600 bg-[length:200%_100%] bg-clip-text text-transparent transition-all duration-500 group-hover:bg-[position:100%_0] group-hover:scale-105 group-active:scale-95">
                Enotik.net
              </span>
            </Link>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-xs">
              Покупайте Robux и виртуальные предметы Roblox мгновенно. Быстрая доставка, безопасная оплата.
            </p>
          </div>

          {/* Help links */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Помощь</h3>
            <nav className="flex flex-col gap-2">
              <Link
                href="/privacy"
                className="text-xs text-muted-foreground hover:text-purple-600 transition-colors"
              >
                Политика конфиденциальности
              </Link>
              <Link
                href="/terms"
                className="text-xs text-muted-foreground hover:text-purple-600 transition-colors"
              >
                Пользовательское соглашение
              </Link>
              <Link
                href="/help"
                className="text-xs text-muted-foreground hover:text-purple-600 transition-colors"
              >
                Помощь
              </Link>
            </nav>
          </div>

          {/* Legal info */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Реквизиты</h3>
            <div className="space-y-1 text-xs text-muted-foreground leading-relaxed">
              <p>ИП Камоев Игорь Константинович</p>
              <p>ИНН: 773420048300</p>
              <p>ОГРНИП: 325774600219972</p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 pt-5 border-t border-border/40">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-[11px] text-muted-foreground/70 text-center sm:text-left">
              &copy; {new Date().getFullYear()} Enotik.net. Все права защищены.
            </p>
            <p className="text-[11px] text-muted-foreground/70 text-center sm:text-right max-w-md">
              Зарегистрированные названия и товарные знаки являются собственностью и авторским правом соответствующих владельцев.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
