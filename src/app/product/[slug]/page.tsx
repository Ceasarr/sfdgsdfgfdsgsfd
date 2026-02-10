import { notFound } from "next/navigation";
import { ProductDetailClient } from "./product-detail-client";

async function fetchProducts() {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/products`, {
            cache: 'no-store'
        });
        if (!res.ok) throw new Error("Не удалось загрузить товары");
        return await res.json();
    } catch (error) {
        console.error("Error fetching products:", error);
        return [];
    }
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
    // Await params in Next.js 15+
    const { slug } = await params;

    // Fetch products from API
    const products = await fetchProducts();

    const product = products.find((p: any) => p.slug === slug);

    if (!product) {
        notFound();
    }

    // Get recommended products (same category, different product, random order)
    const sameCategoryProducts = products
        .filter((p: any) => p.category === product.category && p.id !== product.id);

    // Fisher-Yates shuffle for true randomness
    for (let i = sameCategoryProducts.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [sameCategoryProducts[i], sameCategoryProducts[j]] = [sameCategoryProducts[j], sameCategoryProducts[i]];
    }

    const recommendedProducts = sameCategoryProducts.slice(0, 4);

    return <ProductDetailClient product={product} recommendedProducts={recommendedProducts} />;
}
