import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: "Googlebot",
                allow: "/",
                disallow: ["/admin", "/api", "/checkout", "/account"],
            },
            {
                userAgent: "Yandex",
                allow: "/",
                disallow: ["/admin", "/api", "/checkout", "/account"],
            },
            {
                userAgent: "*",
                allow: "/",
                disallow: ["/admin", "/api", "/checkout", "/account"],
            },
        ],
        sitemap: "https://enotik.net/sitemap.xml",
        host: "https://enotik.net",
    };
}
