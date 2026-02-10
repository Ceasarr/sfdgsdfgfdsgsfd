export interface Product {
    id: string;
    slug: string;
    name: string;
    description: string;
    price: number;
    oldPrice?: number;
    rarity: string;
    category: string;
    game?: string;
    stock: number;
    image: string;
    createdAt: Date;
}

export interface CartItem {
    product: Product;
    quantity: number;
}

export interface Order {
    id: string;
    userId?: string;
    status: string;
    total: number;
    robloxUsername: string;
    createdAt: Date;
}

export interface PromoCode {
    id: string;
    code: string;
    discountPercent: number;
}
