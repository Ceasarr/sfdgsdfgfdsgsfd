import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminUser } from '@/lib/auth';

// GET /api/products - Get all products (public)
export async function GET() {
    try {
        const products = await prisma.product.findMany({
            orderBy: {
                createdAt: 'desc',
            },
        });

        return NextResponse.json(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        return NextResponse.json(
            { error: 'Не удалось получить список товаров' },
            { status: 500 }
        );
    }
}

// POST /api/products - Create a new product (admin only)
export async function POST(request: Request) {
    try {
        const admin = await getAdminUser();
        if (!admin) {
            return NextResponse.json(
                { error: 'Доступ запрещён' },
                { status: 403 }
            );
        }

        const body = await request.json();
        const { name, description, price, oldPrice, rarity, category, game, stock, image } = body;

        // Validation
        if (!name || !description || !price || !rarity || !category || stock === undefined || !image) {
            return NextResponse.json(
                { error: 'Не заполнены обязательные поля' },
                { status: 400 }
            );
        }

        // Generate slug from name with collision handling
        let baseSlug = name
            .toLowerCase()
            .replace(/[^a-z0-9а-яё]+/g, '-')
            .replace(/(^-|-$)/g, '');

        let slug = baseSlug;
        let suffix = 0;

        // Check for slug uniqueness, append suffix if needed
        while (true) {
            const existing = await prisma.product.findUnique({ where: { slug } });
            if (!existing) break;
            suffix++;
            slug = `${baseSlug}-${suffix}`;
        }

        // Create product
        const product = await prisma.product.create({
            data: {
                slug,
                name,
                description,
                price: parseInt(price),
                oldPrice: oldPrice ? parseInt(oldPrice) : null,
                rarity,
                category,
                game: game || "",
                stock: parseInt(stock),
                image,
            },
        });

        return NextResponse.json(product, { status: 201 });
    } catch (error) {
        console.error('Error creating product:', error);
        return NextResponse.json(
            { error: 'Не удалось создать товар' },
            { status: 500 }
        );
    }
}
