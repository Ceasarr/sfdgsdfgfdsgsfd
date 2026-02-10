/**
 * Основной seed-скрипт.
 * Безопасно вносит товары, RobuxItem и настройки через upsert.
 *
 * Запуск:  npx tsx prisma/seed.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface ProductSeed {
    slug: string;
    name: string;
    description: string;
    price: number;
    oldPrice?: number;
    rarity: string;
    category: string;
    game: string;
    stock: number;
    image: string;
}

async function main() {
    console.log("🌱 Запуск seed...\n");

    // ─── 1. Товары (обычный каталог) ───────────────────────────────────────
    const products: ProductSeed[] = [
        {
            slug: "golden-knife",
            name: "Золотой нож",
            description:
                "Легендарный золотой нож из Steal a Brainrot. Редкий коллекционный предмет с уникальными анимациями атаки и стильной золотой текстурой.",
            price: 4999,
            rarity: "legendary",
            category: "Items",
            game: "Steal a Brainrot",
            stock: 50,
            image: "/products/golden-knife.jpg",
        },
        {
            slug: "galaxy-effect",
            name: "Эффект «Галактика»",
            description:
                "Эпический галактический эффект частиц для вашего персонажа. Окутывает аватар мерцающими звёздами и космической пылью.",
            price: 2499,
            rarity: "epic",
            category: "Items",
            game: "Steal a Brainrot",
            stock: 100,
            image: "/products/galaxy-effect.jpg",
        },
        {
            slug: "shadow-blade",
            name: "Клинок Тени",
            description:
                "Редкий клинок с уникальными теневыми анимациями. При каждом ударе оставляет за собой шлейф тёмной энергии.",
            price: 1999,
            rarity: "rare",
            category: "Items",
            game: "Steal a Brainrot",
            stock: 75,
            image: "/products/shadow-blade.jpg",
        },
        {
            slug: "godly-set",
            name: "Божественный стартовый набор",
            description:
                "Полный набор «Godly»: нож, эффект и аксессуары. Включает эксклюзивные предметы, которые больше нельзя получить в игре.",
            price: 9999,
            oldPrice: 12999,
            rarity: "godly",
            category: "Items",
            game: "Steal a Brainrot",
            stock: 25,
            image: "/products/godly-set.jpg",
        },
        {
            slug: "fire-aura",
            name: "Огненная аура",
            description:
                "Окутайте своего персонажа пламенной аурой. Анимированный эффект огня, видимый всем игрокам на сервере.",
            price: 1499,
            rarity: "rare",
            category: "Items",
            game: "Steal a Brainrot",
            stock: 120,
            image: "/products/fire-aura.jpg",
        },
        {
            slug: "rainbow-wings",
            name: "Радужные крылья",
            description:
                "Эпические крылья с переливающейся радужной текстурой. Позволяют парить и оставлять цветной след в воздухе.",
            price: 3499,
            rarity: "epic",
            category: "Items",
            game: "Steal a Brainrot",
            stock: 60,
            image: "/products/rainbow-wings.jpg",
        },
        {
            slug: "frost-dagger",
            name: "Ледяной кинжал",
            description:
                "Обычный, но стильный кинжал с ледяными частицами. Замораживает врагов при попадании на 0.5 секунды.",
            price: 799,
            rarity: "common",
            category: "Items",
            game: "Steal a Brainrot",
            stock: 200,
            image: "/products/frost-dagger.jpg",
        },
        {
            slug: "neon-katana",
            name: "Неоновая катана",
            description:
                "Редкая катана в неоновом стиле с яркой подсветкой. Светится в темноте и создаёт эффектные неоновые полосы при взмахе.",
            price: 2799,
            rarity: "rare",
            category: "Items",
            game: "Steal a Brainrot",
            stock: 80,
            image: "/products/neon-katana.jpg",
        },
        {
            slug: "void-crown",
            name: "Корона Бездны",
            description:
                "Легендарная корона из самого сердца Бездны. Окружает голову тёмной энергией и даёт уникальную анимацию при появлении.",
            price: 5999,
            rarity: "legendary",
            category: "Items",
            game: "Steal a Brainrot",
            stock: 30,
            image: "/products/void-crown.jpg",
        },
        {
            slug: "pixel-pet-dragon",
            name: "Пиксельный дракончик",
            description:
                "Милый пиксельный питомец-дракончик, который летает рядом с вашим персонажем. Может менять цвет по команде.",
            price: 1299,
            rarity: "common",
            category: "Pets",
            game: "Steal a Brainrot",
            stock: 150,
            image: "/products/pixel-pet-dragon.jpg",
        },
    ];

    // Use raw SQL upsert to avoid Prisma client version mismatch
    // (game field may not be in generated client yet)
    for (const p of products) {
        await prisma.$executeRawUnsafe(
            `INSERT INTO "Product" ("id", "slug", "name", "description", "price", "oldPrice", "rarity", "category", "game", "stock", "image", "createdAt")
             VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
             ON CONFLICT ("slug") DO UPDATE SET
               "name" = EXCLUDED."name",
               "description" = EXCLUDED."description",
               "price" = EXCLUDED."price",
               "oldPrice" = EXCLUDED."oldPrice",
               "rarity" = EXCLUDED."rarity",
               "category" = EXCLUDED."category",
               "game" = EXCLUDED."game",
               "stock" = EXCLUDED."stock",
               "image" = EXCLUDED."image"`,
            p.slug,
            p.name,
            p.description,
            p.price,
            p.oldPrice ?? null,
            p.rarity,
            p.category,
            p.game,
            p.stock,
            p.image
        );
        console.log(`  ✅ ${p.name} (${p.slug})`);
    }
    console.log(`\n📦 Товары: ${products.length} шт.\n`);

    // ─── 2. RobuxItem (пакеты мгновенного пополнения) ──────────────────────
    const robuxItems = [
        { amount: 200, price: 220 },
        { amount: 400, price: 440 },
        { amount: 800, price: 880 },
        { amount: 1000, price: 1100 },
        { amount: 2000, price: 2200 },
        { amount: 5000, price: 5500 },
    ];

    for (const item of robuxItems) {
        await prisma.robuxItem.upsert({
            where: { amount: item.amount },
            update: { price: item.price, active: true },
            create: { amount: item.amount, price: item.price, active: true },
        });
        console.log(`  💎 ${item.amount} Robux → ${item.price} ₽`);
    }
    console.log(`\n💎 RobuxItem: ${robuxItems.length} шт.\n`);

    // ─── 3. Настройки ──────────────────────────────────────────────────────
    await prisma.setting.upsert({
        where: { key: "gamepass_rate" },
        update: { value: "0.9" },
        create: { key: "gamepass_rate", value: "0.9" },
    });
    console.log("  ⚙️  gamepass_rate = 0.9 ₽/R$");

    // ─── 4. Удаляем старые Robux-товары из каталога продуктов ──────────────
    // (раньше Robux были обычными Product-ами, теперь они в RobuxItem)
    const deletedRobuxProducts = await prisma.product.deleteMany({
        where: {
            slug: { in: ["robux-400", "robux-800", "robux-1700", "robux-4500"] },
        },
    });
    if (deletedRobuxProducts.count > 0) {
        console.log(`\n  🗑️  Удалено ${deletedRobuxProducts.count} старых Robux-товаров из каталога Product`);
    }

    console.log("\n✨ Seed завершён!");
}

main()
    .catch((e) => {
        console.error("❌ Ошибка seed:", e);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
