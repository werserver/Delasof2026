/**
 * SitemapPage — Renders sitemap.xml content
 * Accessible at /sitemap.xml via a redirect in vercel.json or vite config
 */
import { useEffect } from "react";
import { useProducts } from "@/hooks/useProducts";
import { getAdminSettings } from "@/lib/store";
import { productPath } from "@/lib/slug";
import { generateSitemapXml } from "@/lib/sitemap";

export default function SitemapPage() {
  const settings = getAdminSettings();
  const { data } = useProducts("", undefined, 1);

  useEffect(() => {
    if (!data) return;

    const slugs = data.data.map((p) =>
      productPath(p.product_id, p.product_name).replace("/product/", "")
    );

    const xml = generateSitemapXml(slugs, settings.categories);

    // Replace the entire document with XML
    document.open("text/xml");
    document.write(xml);
    document.close();
  }, [data, settings.categories]);

  return null;
}
