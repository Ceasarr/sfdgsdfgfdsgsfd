// Simple className utility without external dependencies
export function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(" ");
}

export function formatPrice(price: number) {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    minimumFractionDigits: 0,
  }).format(price);
}

export function getRarityColor(rarity: string): string {
  const colors: Record<string, string> = {
    common: "bg-gray-500",
    rare: "bg-blue-500",
    epic: "bg-purple-500",
    legendary: "bg-orange-500",
    godly: "bg-red-600",
  };
  return colors[rarity.toLowerCase()] || colors.common;
}

/** CSS class name for the rarity glow box-shadow (defined in globals.css) */
export function getRarityGlow(rarity: string): string {
  const key = rarity.toLowerCase();
  const valid = ["common", "rare", "epic", "legendary", "godly"];
  return `rarity-glow-${valid.includes(key) ? key : "common"}`;
}
