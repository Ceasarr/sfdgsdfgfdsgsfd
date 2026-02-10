import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminUser } from '@/lib/auth';

// GET /api/products/[id] - Get a single product (public)
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const product = await prisma.product.findUnique({
            where: { id },
        });

        if (!product) {
            return NextResponse.json(
                { error: 'Товар не найден' },
                { status: 404 }
            );
        }

        return NextResponse.json(product);
    } catch (error) {
        console.error('Error fetching product:', error);
        return NextResponse.json(
            { error: 'Не удалось получить товар' },
            { status: 500 }
        );
    }
}

// PUT /api/products/[id] - Update a product (admin only)
export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const admin = await getAdminUser();
        if (!admin) {
            return NextResponse.json({ error: 'Доступ запрещён' }, { status: 403 });
        }

        const { id } = await params;
        const body = await request.json();
        const { name, description, price, oldPrice, rarity, category, game, stock, image } = body;

        // Check if product exists
        const existingProduct = await prisma.product.findUnique({
            where: { id },
        });

        if (!existingProduct) {
            return NextResponse.json(
                { error: 'Товар не найден' },
                { status: 404 }
            );
        }

        // Update slug if name changed
        let slug = existingProduct.slug;
        if (name && name !== existingProduct.name) {
            slug = name
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '');
        }

        // Update product
        const product = await prisma.product.update({
            where: { id },
            data: {
                slug,
                name: name || existingProduct.name,
                description: description || existingProduct.description,
                price: price !== undefined ? parseInt(price) : existingProduct.price,
                oldPrice: oldPrice !== undefined ? (oldPrice ? parseInt(oldPrice) : null) : existingProduct.oldPrice,
                rarity: rarity || existingProduct.rarity,
                category: category || existingProduct.category,
                game: game !== undefined ? (game || "") : existingProduct.game,
                stock: stock !== undefined ? parseInt(stock) : existingProduct.stock,
                image: image || existingProduct.image,
            },
        });

        return NextResponse.json(product);
    } catch (error) {
        console.error('Error updating product:', error);
        return NextResponse.json(
            { error: 'Не удалось обновить товар' },
            { status: 500 }
        );
    }
}

// DELETE /api/products/[id] - Delete a product (admin only)
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const admin = await getAdminUser();
        if (!admin) {
            return NextResponse.json({ error: 'Доступ запрещён' }, { status: 403 });
        }

        const { id } = await params;
        // Check if product exists
        const existingProduct = await prisma.product.findUnique({
            where: { id },
        });

        if (!existingProduct) {
            return NextResponse.json(
                { error: 'Товар не найден' },
                { status: 404 }
            );
        }

        // Delete product
        await prisma.product.delete({
            where: { id },
        });

        return NextResponse.json({ message: 'Товар успешно удалён' });
    } catch (error) {
        console.error('Error deleting product:', error);
        return NextResponse.json(
            { error: 'Не удалось удалить товар' },
            { status: 500 }
        );
    }
}
