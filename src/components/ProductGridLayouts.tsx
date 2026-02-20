/**
 * ProductGridLayouts — Multiple layout variants for product display
 * Layout is randomized per category/section using a deterministic hash
 * so it stays consistent across re-renders but varies between sections.
 */

import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { WishlistButton } from "@/components/WishlistButton";
import { StarRating } from "@/components/StarRating";
import { formatPrice, getProductRating, type Product } from "@/lib/api";
import { productPath } from "@/lib/slug";
import { getAdminSettings } from "@/lib/store";
import { getPrefixedName } from "@/lib/prefix-words";

export type LayoutVariant =
  | "grid-5"      // 5 columns standard grid
  | "grid-4"      // 4 columns wider cards
  | "grid-3"      // 3 columns large cards
  | "list"        // Horizontal list
  | "masonry"     // Masonry-like with featured first
  | "magazine";   // Magazine style: 1 large + 4 small

const LAYOUT_VARIANTS: LayoutVariant[] = [
  "grid-5",
  "grid-4",
  "grid-3",
  "list",
  "masonry",
  "magazine",
];

// Deterministic hash for consistent layout per section
function sectionHash(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (h * 31 + seed.charCodeAt(i)) & 0xffffffff;
  }
  return Math.abs(h);
}

export function getLayoutForSection(sectionId: string): LayoutVariant {
  const idx = sectionHash(sectionId) % LAYOUT_VARIANTS.length;
  return LAYOUT_VARIANTS[idx];
}

interface ProductCardInnerProps {
  product: Product;
  displayName: string;
  compact?: boolean;
}

function ProductCardInner({ product, displayName, compact = false }: ProductCardInnerProps) {
  const { rating, reviewCount } = getProductRating(product.product_id);
  const hasDiscount = product.product_discounted_percentage > 0;

  return (
    <div className={`group overflow-hidden rounded-xl border bg-card shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1 animate-fade-in`}>
      <Link to={productPath(product.product_id, product.product_name)} state={{ product }}>
        <div className={`relative overflow-hidden bg-muted ${compact ? "aspect-[4/3]" : "aspect-square"}`}>
          <img
            src={product.product_picture}
            alt={displayName}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
            decoding="async"
          />
          {hasDiscount && (
            <Badge className="absolute left-2 top-2 bg-sale text-primary-foreground border-0 text-xs font-semibold">
              -{product.product_discounted_percentage}%
            </Badge>
          )}
          <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <WishlistButton product={product} />
          </div>
        </div>
        <div className={`${compact ? "p-2" : "p-3"} space-y-1.5`}>
          <h3 className="line-clamp-2 text-sm font-medium leading-snug text-card-foreground hover:text-primary transition-colors">
            {displayName}
          </h3>
          {!compact && <StarRating rating={rating} count={reviewCount} />}
          <div className="flex items-baseline gap-2">
            <span className={`font-bold text-primary ${compact ? "text-sm" : "text-lg"}`}>
              {formatPrice(hasDiscount ? product.product_discounted : product.product_price, product.product_currency)}
            </span>
            {hasDiscount && (
              <span className="text-xs text-muted-foreground line-through">
                {formatPrice(product.product_price, product.product_currency)}
              </span>
            )}
          </div>
          {!compact && (
            <p className="text-xs text-muted-foreground truncate">{product.category_name}</p>
          )}
        </div>
      </Link>
    </div>
  );
}

function ListCard({ product, displayName }: { product: Product; displayName: string }) {
  const { rating, reviewCount } = getProductRating(product.product_id);
  const hasDiscount = product.product_discounted_percentage > 0;

  return (
    <div className="group flex gap-3 rounded-xl border bg-card shadow-sm transition-all hover:shadow-md hover:bg-muted/30 animate-fade-in">
      <Link
        to={productPath(product.product_id, product.product_name)}
        state={{ product }}
        className="flex gap-3 w-full p-3"
      >
        <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
          <img
            src={product.product_picture}
            alt={displayName}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
            decoding="async"
          />
          {hasDiscount && (
            <Badge className="absolute left-1 top-1 bg-sale text-primary-foreground border-0 text-[10px] font-semibold px-1">
              -{product.product_discounted_percentage}%
            </Badge>
          )}
        </div>
        <div className="flex flex-col justify-between flex-1 min-w-0">
          <h3 className="line-clamp-2 text-sm font-medium leading-snug text-card-foreground hover:text-primary transition-colors">
            {displayName}
          </h3>
          <StarRating rating={rating} count={reviewCount} />
          <div className="flex items-baseline gap-2">
            <span className="text-base font-bold text-primary">
              {formatPrice(hasDiscount ? product.product_discounted : product.product_price, product.product_currency)}
            </span>
            {hasDiscount && (
              <span className="text-xs text-muted-foreground line-through">
                {formatPrice(product.product_price, product.product_currency)}
              </span>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}

interface MultiLayoutGridProps {
  products?: Product[];
  isLoading?: boolean;
  layout?: LayoutVariant;
  sectionId?: string;
}

export function MultiLayoutGrid({
  products,
  isLoading = false,
  layout,
  sectionId = "default",
}: MultiLayoutGridProps) {
  const settings = getAdminSettings();
  const activeLayout = layout || getLayoutForSection(sectionId);

  const getDisplayName = (product: Product) => {
    if (settings.enablePrefixWords && settings.prefixWordsList?.length > 0) {
      return getPrefixedName(product.product_id, product.product_name, settings.prefixWordsList);
    }
    return product.product_name;
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="space-y-3 rounded-xl border bg-card p-3">
            <Skeleton className="aspect-square w-full rounded-lg" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="h-5 w-1/3" />
          </div>
        ))}
      </div>
    );
  }

  if (!products?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <p className="text-base font-medium text-muted-foreground">ไม่พบสินค้า</p>
      </div>
    );
  }

  // ---- Layout: grid-5 ----
  if (activeLayout === "grid-5") {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {products.map((p) => (
          <ProductCardInner key={p.product_id} product={p} displayName={getDisplayName(p)} />
        ))}
      </div>
    );
  }

  // ---- Layout: grid-4 ----
  if (activeLayout === "grid-4") {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {products.map((p) => (
          <ProductCardInner key={p.product_id} product={p} displayName={getDisplayName(p)} />
        ))}
      </div>
    );
  }

  // ---- Layout: grid-3 ----
  if (activeLayout === "grid-3") {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
        {products.map((p) => (
          <ProductCardInner key={p.product_id} product={p} displayName={getDisplayName(p)} />
        ))}
      </div>
    );
  }

  // ---- Layout: list ----
  if (activeLayout === "list") {
    return (
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {products.map((p) => (
          <ListCard key={p.product_id} product={p} displayName={getDisplayName(p)} />
        ))}
      </div>
    );
  }

  // ---- Layout: masonry (featured first) ----
  if (activeLayout === "masonry") {
    const [featured, ...rest] = products;
    return (
      <div className="space-y-3">
        {featured && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="sm:row-span-2">
              <ProductCardInner product={featured} displayName={getDisplayName(featured)} />
            </div>
            {rest.slice(0, 2).map((p) => (
              <ProductCardInner key={p.product_id} product={p} displayName={getDisplayName(p)} compact />
            ))}
          </div>
        )}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {rest.slice(2).map((p) => (
            <ProductCardInner key={p.product_id} product={p} displayName={getDisplayName(p)} compact />
          ))}
        </div>
      </div>
    );
  }

  // ---- Layout: magazine (1 large + rest in grid) ----
  if (activeLayout === "magazine") {
    const [hero, ...rest] = products;
    const { rating: heroRating, reviewCount: heroReviewCount } = getProductRating(hero?.product_id || "");
    const heroHasDiscount = (hero?.product_discounted_percentage || 0) > 0;
    const heroDisplayName = hero ? getDisplayName(hero) : "";

    return (
      <div className="space-y-4">
        {/* Hero card */}
        {hero && (
          <div className="group overflow-hidden rounded-2xl border bg-card shadow-sm transition-all hover:shadow-xl animate-fade-in">
            <Link to={productPath(hero.product_id, hero.product_name)} state={{ product: hero }}>
              <div className="relative aspect-[16/7] overflow-hidden bg-muted">
                <img
                  src={hero.product_picture}
                  alt={heroDisplayName}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                  decoding="async"
                />
                {heroHasDiscount && (
                  <Badge className="absolute left-3 top-3 bg-sale text-primary-foreground border-0 text-sm font-bold px-3 py-1">
                    -{hero.product_discounted_percentage}%
                  </Badge>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="text-white font-bold text-lg line-clamp-2 mb-1">{heroDisplayName}</h3>
                  <div className="flex items-center gap-3">
                    <span className="text-white text-xl font-bold">
                      {formatPrice(heroHasDiscount ? hero.product_discounted : hero.product_price, hero.product_currency)}
                    </span>
                    {heroHasDiscount && (
                      <span className="text-white/70 text-sm line-through">
                        {formatPrice(hero.product_price, hero.product_currency)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          </div>
        )}
        {/* Rest in grid */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {rest.map((p) => (
            <ProductCardInner key={p.product_id} product={p} displayName={getDisplayName(p)} compact />
          ))}
        </div>
      </div>
    );
  }

  // Fallback
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {products.map((p) => (
        <ProductCardInner key={p.product_id} product={p} displayName={getDisplayName(p)} />
      ))}
    </div>
  );
}
