import { Helmet } from "react-helmet-async";
import { getAdminSettings } from "@/lib/store";

interface SEOHeadProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
  canonical?: string;
  keywords?: string;
  breadcrumbs?: { name: string; url: string }[];
  product?: {
    name: string;
    price: number;
    currency: string;
    image: string;
    rating: number;
    reviewCount: number;
    availability?: string;
  };
}

export function SEOHead({
  title,
  description = "รวมสินค้าลดราคา โปรโมชั่นสุดคุ้ม จากร้านค้าชั้นนำ",
  image,
  url,
  type = "website",
  canonical,
  keywords,
  breadcrumbs,
  product,
}: SEOHeadProps) {
  const settings = getAdminSettings();
  const siteName = settings.siteName || "ThaiDeals";
  const favicon = settings.faviconUrl || "/favicon.ico";
  
  const defaultTitle = `${siteName} — สินค้าดีลพิเศษ`;
  const currentTitle = title || defaultTitle;
  const fullTitle = currentTitle.includes(siteName) ? currentTitle : `${currentTitle} | ${siteName}`;
  
  const pageUrl = url || (typeof window !== "undefined" ? window.location.href : "");
  const canonicalUrl = canonical || pageUrl;
  const origin = typeof window !== "undefined" ? window.location.origin : "";

  const defaultKeywords = settings.keywords?.join(", ") || "สินค้าลดราคา, โปรโมชั่น, ดีลเด็ด";
  const metaKeywords = keywords || defaultKeywords;

  const jsonLdItems: object[] = [];

  if (product) {
    jsonLdItems.push({
      "@context": "https://schema.org",
      "@type": "Product",
      name: product.name,
      image: product.image,
      description: description.slice(0, 160),
      offers: {
        "@type": "Offer",
        price: product.price,
        priceCurrency: product.currency,
        availability: product.availability || "https://schema.org/InStock",
        url: pageUrl,
      },
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: product.rating,
        reviewCount: product.reviewCount,
        bestRating: 5,
        worstRating: 1,
      },
    });
  } else {
    jsonLdItems.push({
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: siteName,
      description,
      url: origin || pageUrl,
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${origin}/?q={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
    });
    jsonLdItems.push({
      "@context": "https://schema.org",
      "@type": "Organization",
      name: siteName,
      url: origin,
      logo: {
        "@type": "ImageObject",
        url: favicon.startsWith("http") ? favicon : `${origin}${favicon}`,
      },
    });
  }

  if (breadcrumbs?.length) {
    jsonLdItems.push({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: breadcrumbs.map((b, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: b.name,
        item: b.url.startsWith("http") ? b.url : `${origin}${b.url}`,
      })),
    });
  }

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description.slice(0, 160)} />
      <meta name="keywords" content={metaKeywords} />
      <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      <meta name="author" content={siteName} />
      <link rel="canonical" href={canonicalUrl} />
      <link rel="icon" href={favicon} />
      <link rel="sitemap" type="application/xml" href="/sitemap.xml" />
      <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
      <meta name="theme-color" content="#f97316" />
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description.slice(0, 160)} />
      <meta property="og:type" content={type} />
      {image && <meta property="og:image" content={image} />}
      {image && <meta property="og:image:alt" content={fullTitle} />}
      <meta property="og:url" content={pageUrl} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content="th_TH" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description.slice(0, 160)} />
      {image && <meta name="twitter:image" content={image} />}
      {image && <meta name="twitter:image:alt" content={fullTitle} />}

      {/* JSON-LD */}
      {jsonLdItems.map((item, i) => (
        <script key={i} type="application/ld+json">{JSON.stringify(item)}</script>
      ))}
    </Helmet>
  );
}
