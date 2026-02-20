// Sitemap generator for SEO crawlers
// Generates /sitemap.xml content dynamically

const getBaseUrl = (): string => {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return "";
};

const today = new Date().toISOString().split("T")[0];

export function generateSitemapXml(
  productSlugs: string[] = [],
  categories: string[] = []
): string {
  const BASE_URL = getBaseUrl();

  const staticRoutes = [
    { loc: "/", priority: "1.0", changefreq: "daily", lastmod: today },
    { loc: "/wishlist", priority: "0.4", changefreq: "weekly", lastmod: today },
  ];

  const categoryRoutes = categories.map((cat) => ({
    loc: `/category/${encodeURIComponent(cat)}`,
    priority: "0.8",
    changefreq: "daily" as const,
    lastmod: today,
  }));

  const productRoutes = productSlugs.map((slug) => ({
    loc: `/product/${slug}`,
    priority: "0.7",
    changefreq: "weekly" as const,
    lastmod: today,
  }));

  const allRoutes = [...staticRoutes, ...categoryRoutes, ...productRoutes];

  const urls = allRoutes
    .map(
      (r) => `  <url>
    <loc>${BASE_URL}${r.loc}</loc>
    <lastmod>${r.lastmod}</lastmod>
    <changefreq>${r.changefreq}</changefreq>
    <priority>${r.priority}</priority>
  </url>`
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${urls}
</urlset>`;
}
