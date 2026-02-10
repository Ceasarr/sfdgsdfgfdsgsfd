import Link from "next/link";

/* ── Guide data ─────────────────────────────────── */

const guides = [
    {
        id: "trade",
        icon: "🔄",
        color: "from-blue-500 to-cyan-500",
        colorLight: "from-blue-50 to-cyan-50",
        borderColor: "hover:border-blue-200",
        accentText: "text-blue-500",
        title: "Получение предметов через трейд",
        subtitle: "Передача купленных предметов на ваш аккаунт Roblox через обмен на сервере",
        steps: [
            {
                number: "01",
                title: "Оформите и оплатите заказ",
                description: "Выберите нужные предметы в каталоге, добавьте их в корзину и завершите оплату. После успешной оплаты вам будет присвоен номер заказа.",
                icon: "🛒",
            },
            {
                number: "02",
                title: "Свяжитесь с поддержкой",
                description: "Напишите нам в Telegram, указав номер заказа. Наш менеджер подтвердит заказ и пришлёт ссылку на приватный сервер в Roblox для обмена.",
                icon: "💬",
            },
            {
                number: "03",
                title: "Зайдите на приватный сервер",
                description: "Перейдите по ссылке и зайдите на указанный приватный сервер в нужной игре (например, Murder Mystery 2, Adopt Me и т.д.). Убедитесь, что вы вошли с того аккаунта, никнейм которого указали при заказе.",
                icon: "🌐",
            },
            {
                number: "04",
                title: "Примите трейд от нашего бота / оператора",
                description: "На сервере наш бот или оператор отправит вам запрос на обмен (Trade Request). В окне трейда вы увидите купленные предметы. Внимательно проверьте список — предметы должны совпадать с вашим заказом.",
                icon: "🤝",
            },
            {
                number: "05",
                title: "Подтвердите обмен",
                description: "Нажмите «Accept» (Принять) в окне трейда. После подтверждения предметы мгновенно окажутся в вашем инвентаре. Готово — можете использовать их в игре!",
                icon: "✅",
            },
        ],
        tips: [
            "Убедитесь, что у вас включены трейды в настройках Roblox: Настройки → Конфиденциальность → Кто может обмениваться со мной → «Все».",
            "Никогда не отправляйте свои предметы первым — мы всегда передаём товар вам, а не наоборот.",
            "Если трейд не приходит в течение 10 минут — перезайдите на сервер и сообщите в поддержку.",
        ],
    },
    {
        id: "code",
        icon: "🔑",
        color: "from-yellow-500 to-orange-500",
        colorLight: "from-yellow-50 to-orange-50",
        borderColor: "hover:border-yellow-200",
        accentText: "text-yellow-600",
        title: "Активация кодов Robux",
        subtitle: "Как использовать цифровой код для пополнения Robux на вашем аккаунте",
        steps: [
            {
                number: "01",
                title: "Купите цифровой код на нашем сайте",
                description: "Перейдите в раздел «Робукс», выберите вкладку «Цифровой код» и купите нужный номинал. После оплаты напишите в поддержку — мы пришлём вам уникальный цифровой код.",
                icon: "💎",
            },
            {
                number: "02",
                title: "Перейдите на страницу активации",
                description: "Откройте браузер и перейдите на официальную страницу активации кодов Roblox: roblox.com/redeem. Если вы не авторизованы — войдите в свой аккаунт Roblox.",
                icon: "🌐",
            },
            {
                number: "03",
                title: "Введите код",
                description: "В поле ввода на странице вставьте или введите полученный цифровой код. Код состоит из букв и цифр — вводите его точно, без пробелов и лишних символов.",
                icon: "⌨️",
            },
            {
                number: "04",
                title: "Нажмите «Redeem» (Активировать)",
                description: "После ввода кода нажмите кнопку «Redeem». Система проверит код и начислит Robux на ваш аккаунт. Вы увидите подтверждение с суммой зачисления.",
                icon: "🎯",
            },
            {
                number: "05",
                title: "Проверьте баланс",
                description: "Робуксы моментально отобразятся на вашем балансе в правом верхнем углу сайта Roblox и в приложении. Теперь можете тратить их на аксессуары, геймпассы и другие товары!",
                icon: "✅",
            },
        ],
        tips: [
            "Код можно активировать только один раз — после использования он становится недействительным.",
            "Если код не работает — проверьте правильность ввода. Если проблема сохраняется, свяжитесь с нашей поддержкой.",
            "Активировать код можно через браузер (roblox.com/redeem) или через мобильное приложение Roblox в разделе «Промокод».",
        ],
    },
    {
        id: "gamepass",
        icon: "🎮",
        color: "from-green-500 to-emerald-500",
        colorLight: "from-green-50 to-emerald-50",
        borderColor: "hover:border-green-200",
        accentText: "text-green-600",
        title: "Получение Robux через геймпасс",
        subtitle: "Пополнение баланса Robux через покупку специального геймпасса",
        steps: [
            {
                number: "01",
                title: "Оформите заказ на сайте",
                description: "Перейдите в раздел «Робукс», выберите вкладку «Геймпасс» и укажите нужное количество Robux с помощью ползунка или поля ввода. Добавьте в корзину и оплатите заказ.",
                icon: "🛒",
            },
            {
                number: "02",
                title: "Напишите в поддержку",
                description: "После оплаты свяжитесь с нами в Telegram, указав номер заказа. Менеджер подтвердит заказ и пришлёт вам ссылку на специальный геймпасс в Roblox.",
                icon: "💬",
            },
            {
                number: "03",
                title: "Создайте геймпасс в Roblox",
                description: "Менеджер объяснит, как создать геймпасс в вашем Roblox-аккаунте (через раздел «Creations» → «Game Passes»). Вам нужно будет создать геймпасс с определённой ценой, которую укажет менеджер.",
                icon: "🛠️",
            },
            {
                number: "04",
                title: "Отправьте ссылку менеджеру",
                description: "Скопируйте ссылку на созданный геймпасс и отправьте её менеджеру в Telegram. Убедитесь, что геймпасс опубликован и доступен для покупки (статус «On Sale»).",
                icon: "🔗",
            },
            {
                number: "05",
                title: "Дождитесь покупки геймпасса",
                description: "Наш менеджер купит ваш геймпасс. После покупки Roblox начислит вам Robux (за вычетом комиссии платформы 30%). Робуксы появятся на вашем балансе в разделе «My Transactions».",
                icon: "💰",
            },
            {
                number: "06",
                title: "Дождитесь зачисления",
                description: "Robux от продажи геймпасса поступают на ваш «Pending» баланс. Они станут доступны для вывода и использования через 3–7 дней (стандартный период ожидания Roblox). После этого вы сможете свободно их тратить.",
                icon: "✅",
            },
        ],
        tips: [
            "Через геймпасс можно получить любое количество Robux — это один из самых выгодных способов.",
            "Учтите комиссию Roblox 30%: если вам нужно 1000 R$, цена геймпасса будет установлена с учётом этой комиссии — менеджер рассчитает всё за вас.",
            "Pending-баланс (ожидающие Robux) можно отслеживать в разделе «My Transactions» → «My Sales» на сайте Roblox.",
            "Если у вас нет опыта создания геймпассов — не волнуйтесь, менеджер проведёт вас по каждому шагу.",
        ],
    },
];

const faqs = [
    {
        q: "Как быстро приходит заказ?",
        a: "Цифровые коды и предметы через трейд — от 5 минут до нескольких часов. Robux через геймпасс — зачисление на Pending-баланс мгновенно после покупки, доступны для использования через 3–7 дней.",
    },
    {
        q: "Безопасно ли покупать Robux на сайте?",
        a: "Да! Мы используем проверенные методы доставки. Ваш аккаунт Roblox в безопасности — мы не запрашиваем пароль от него.",
    },
    {
        q: "Что делать, если заказ не пришёл?",
        a: "Свяжитесь с нашей поддержкой в Telegram — мы разберёмся и обязательно решим проблему.",
    },
    {
        q: "Можно ли вернуть Robux?",
        a: "После доставки Robux на аккаунт возврат невозможен. Перед покупкой убедитесь, что указали верный никнейм.",
    },
    {
        q: "Как использовать промокод?",
        a: "На странице оформления заказа есть поле для промокода. Введите код и нажмите «Применить» — скидка отобразится автоматически.",
    },
    {
        q: "Какие способы оплаты доступны?",
        a: "Мы принимаем банковские карты, электронные кошельки и другие популярные способы оплаты.",
    },
    {
        q: "Чем отличается цифровой код от геймпасса?",
        a: "Цифровой код — это готовый код для активации, Robux зачисляются мгновенно. Геймпасс — более выгодный способ, но Robux поступают на Pending-баланс с ожиданием 3–7 дней.",
    },
];

export default function HelpPage() {
    return (
        <main className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-10 sm:py-16 max-w-4xl">
                {/* Header */}
                <div className="text-center mb-12 sm:mb-16">
                    <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 shadow-lg shadow-purple-500/25 mb-6">
                        <span className="text-3xl">📖</span>
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-bold mb-3">
                        Инструкции и{" "}
                        <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                            помощь
                        </span>
                    </h1>
                    <p className="text-muted-foreground text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
                        Подробные пошаговые инструкции по получению предметов и Robux
                    </p>
                </div>

                {/* Quick Navigation */}
                <section className="mb-10 sm:mb-14">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {guides.map((guide) => (
                            <a
                                key={guide.id}
                                href={`#${guide.id}`}
                                className={`group flex items-center gap-3 rounded-2xl border border-border bg-card p-4 transition-all hover:shadow-lg ${guide.borderColor}`}
                            >
                                <div className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${guide.colorLight} text-xl transition-transform group-hover:scale-110`}>
                                    {guide.icon}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-foreground leading-tight">{guide.title}</p>
                                </div>
                            </a>
                        ))}
                    </div>
                </section>

                {/* Guides */}
                <div className="space-y-12 sm:space-y-16 mb-16 sm:mb-20">
                    {guides.map((guide) => (
                        <section key={guide.id} id={guide.id} className="scroll-mt-24">
                            {/* Guide Header */}
                            <div className="flex items-start gap-4 mb-6 sm:mb-8">
                                <div className={`flex-shrink-0 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${guide.color} text-2xl text-white shadow-lg`}>
                                    {guide.icon}
                                </div>
                                <div>
                                    <h2 className="text-xl sm:text-2xl font-bold text-foreground">{guide.title}</h2>
                                    <p className="text-sm text-muted-foreground mt-1">{guide.subtitle}</p>
                                </div>
                            </div>

                            {/* Steps */}
                            <div className="space-y-4 sm:space-y-5 mb-6">
                                {guide.steps.map((step, i) => (
                                    <div
                                        key={step.number}
                                        className={`group relative rounded-2xl border border-border bg-card p-5 sm:p-6 transition-all hover:shadow-lg ${guide.borderColor}`}
                                    >
                                        <div className="flex gap-4 sm:gap-5">
                                            <div className="flex-shrink-0">
                                                <div className={`flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-xl bg-gradient-to-br ${guide.colorLight} text-2xl sm:text-3xl transition-transform group-hover:scale-110`}>
                                                    {step.icon}
                                                </div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-baseline gap-2 mb-1">
                                                    <span className={`text-xs font-bold ${guide.accentText} tracking-wider`}>
                                                        ШАГ {step.number}
                                                    </span>
                                                </div>
                                                <h3 className="text-base sm:text-lg font-bold text-foreground mb-1">
                                                    {step.title}
                                                </h3>
                                                <p className="text-sm text-muted-foreground leading-relaxed">
                                                    {step.description}
                                                </p>
                                            </div>
                                        </div>

                                        {i < guide.steps.length - 1 && (
                                            <div className={`absolute -bottom-4 sm:-bottom-4 left-[2.25rem] sm:left-[2.6rem] w-px h-4 sm:h-4 bg-gradient-to-b ${guide.color} opacity-30`} />
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Tips */}
                            {guide.tips && guide.tips.length > 0 && (
                                <div className={`rounded-2xl border border-border bg-gradient-to-br ${guide.colorLight} p-5 sm:p-6`}>
                                    <h4 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                                        <span>💡</span> Полезные советы
                                    </h4>
                                    <ul className="space-y-2">
                                        {guide.tips.map((tip, i) => (
                                            <li key={i} className="flex gap-2.5 text-sm text-muted-foreground leading-relaxed">
                                                <span className="flex-shrink-0 mt-1 h-1.5 w-1.5 rounded-full bg-current opacity-40" />
                                                {tip}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </section>
                    ))}
                </div>

                {/* CTA */}
                <section className="text-center mb-16 sm:mb-20">
                    <div className="rounded-2xl border border-purple-200 bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50 p-8 sm:p-10">
                        <h2 className="text-xl sm:text-2xl font-bold mb-2">Готовы начать?</h2>
                        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                            Перейдите в магазин и выберите нужные Robux или предметы — это быстро и безопасно!
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                            <Link
                                href="/"
                                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-3 text-sm font-bold text-white shadow-lg shadow-purple-500/25 transition-all hover:shadow-purple-500/40 hover:from-purple-500 hover:to-pink-500 active:scale-95"
                            >
                                🛍️ Перейти в магазин
                            </Link>
                            <Link
                                href="/robux"
                                className="inline-flex items-center gap-2 rounded-xl border border-purple-200 bg-white px-8 py-3 text-sm font-bold text-purple-700 shadow-sm transition-all hover:bg-purple-50 active:scale-95"
                            >
                                💎 Купить Robux
                            </Link>
                        </div>
                    </div>
                </section>

                {/* FAQ */}
                <section>
                    <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8">
                        Частые вопросы
                    </h2>
                    <div className="space-y-3">
                        {faqs.map((faq, i) => (
                            <details
                                key={i}
                                className="group rounded-2xl border border-border bg-card overflow-hidden transition-all hover:border-purple-200"
                            >
                                <summary className="flex items-center justify-between cursor-pointer px-5 py-4 text-sm sm:text-base font-semibold text-foreground select-none list-none [&::-webkit-details-marker]:hidden">
                                    {faq.q}
                                    <span className="flex-shrink-0 ml-3 h-6 w-6 rounded-full bg-muted flex items-center justify-center text-muted-foreground transition-transform group-open:rotate-45 text-lg leading-none">
                                        +
                                    </span>
                                </summary>
                                <div className="px-5 pb-4 text-sm text-muted-foreground leading-relaxed">
                                    {faq.a}
                                </div>
                            </details>
                        ))}
                    </div>
                </section>
            </div>
        </main>
    );
}
