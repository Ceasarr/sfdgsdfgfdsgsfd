import { notFound } from "next/navigation";
import { Metadata } from "next";
import { ProductDetailClient } from "./product-detail-client";

const siteUrl = "https://enotik.net";

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

// Dynamic metadata for each product page
export async function generateMetadata({
    params,
}: {
    params: Promise<{ slug: string }>;
}): Promise<Metadata> {
    const { slug } = await params;
    const products = await fetchProducts();
    const product = products.find((p: any) => p.slug === slug);

    if (!product) {
        return {
            title: "Товар не найден",
        };
    }

    const title = `${product.name} — купить в Enotik.net`;
    const description = product.description
        ? `${product.description.slice(0, 150)}. Купить ${product.name} для Roblox по лучшей цене с мгновенной доставкой.`
        : `Купить ${product.name} для Roblox по лучшей цене. Мгновенная доставка, безопасная оплата. Enotik.net`;
    const productUrl = `${siteUrl}/product/${product.slug}`;

    return {
        title: product.name,
        description,
        keywords: [
            product.name,
            product.category,
            product.game,
            "roblox",
            "купить",
            "enotik",
        ].filter(Boolean),
        alternates: {
            canonical: productUrl,
        },
        openGraph: {
            type: "website",
            url: productUrl,
            title,
            description,
            siteName: "Enotik.net",
            locale: "ru_RU",
            images: product.image
                ? [
                      {
                          url: product.image,
                          width: 600,
                          height: 600,
                          alt: product.name,
                      },
                  ]
                : undefined,
        },
        twitter: {
            card: "summary_large_image",
            title,
            description,
            images: product.image ? [product.image] : undefined,
        },
    };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
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

    // JSON-LD Product structured data
    const productJsonLd = {
        "@context": "https://schema.org",
        "@type": "Product",
        name: product.name,
        description: product.description || `${product.name} — виртуальный предмет для Roblox`,
        image: product.image || undefined,
        url: `${siteUrl}/product/${product.slug}`,
        category: product.category,
        brand: {
            "@type": "Brand",
            name: product.game || "Roblox",
        },
        offers: {
            "@type": "Offer",
            price: product.price,
            priceCurrency: "RUB",
            availability: product.stock > 0
                ? "https://schema.org/InStock"
                : "https://schema.org/OutOfStock",
            seller: {
                "@type": "Organization",
                name: "Enotik.net",
            },
        },
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
            />
            <ProductDetailClient product={product} recommendedProducts={recommendedProducts} />
        </>
    );
}
