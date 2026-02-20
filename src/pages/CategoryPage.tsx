import { useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { SEOHead } from "@/components/SEOHead";
import { MultiLayoutGrid, getLayoutForSection } from "@/components/ProductGridLayouts";
import { FilterBar, type SortOption } from "@/components/FilterBar";
import { PaginationBar } from "@/components/PaginationBar";
import { SearchBar } from "@/components/SearchBar";
import { useProducts } from "@/hooks/useProducts";
import { getAdminSettings } from "@/lib/store";
import { Footer } from "@/components/Footer";
import { ArrowLeft, Tag, LayoutGrid, List, Grid3X3 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { LayoutVariant } from "@/components/ProductGridLayouts";

const LAYOUT_CYCLE: LayoutVariant[] = ["grid-5", "grid-4", "grid-3", "list", "magazine"];

export default function CategoryPage() {
  const { name } = useParams<{ name: string }>();
  const categoryName = decodeURIComponent(name || "");
  const settings = getAdminSettings();

  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<SortOption>("default");
  const [priceMin, setPriceMin] = useState<number | undefined>();
  const [priceMax, setPriceMax] = useState<number | undefined>();
  const [layoutOverride, setLayoutOverride] = useState<LayoutVariant | undefined>(undefined);

  const { data, isLoading } = useProducts(keyword || categoryName, undefined, page);

  const handleSearch = (kw: string) => {
    setKeyword(kw);
    setPage(1);
  };

  const filteredProducts = useMemo(() => {
    if (!data?.data) return [];
    let items = [...data.data];

    if (priceMin !== undefined) {
      items = items.filter((p) => (p.product_discounted || p.product_price) >= priceMin);
    }
    if (priceMax !== undefined) {
      items = items.filter((p) => (p.product_discounted || p.product_price) <= priceMax);
    }

    if (sort === "price-asc") {
      items.sort((a, b) => (a.product_discounted || a.product_price) - (b.product_discounted || b.product_price));
    } else if (sort === "price-desc") {
      items.sort((a, b) => (b.product_discounted || b.product_price) - (a.product_discounted || a.product_price));
    } else if (sort === "discount") {
      items.sort((a, b) => b.product_discounted_percentage - a.product_discounted_percentage);
    }

    return items;
  }, [data?.data, priceMin, priceMax, sort]);

  const activeLayout = layoutOverride || getLayoutForSection(categoryName);
  const siteName = settings.siteName || "ThaiDeals";

  const cycleLayout = () => {
    const currentIdx = LAYOUT_CYCLE.indexOf(activeLayout);
    const nextIdx = (currentIdx + 1) % LAYOUT_CYCLE.length;
    setLayoutOverride(LAYOUT_CYCLE[nextIdx]);
  };

  const layoutIcon = {
    "grid-5": <LayoutGrid className="h-4 w-4" />,
    "grid-4": <LayoutGrid className="h-4 w-4" />,
    "grid-3": <Grid3X3 className="h-4 w-4" />,
    "list": <List className="h-4 w-4" />,
    "masonry": <Grid3X3 className="h-4 w-4" />,
    "magazine": <LayoutGrid className="h-4 w-4" />,
  }[activeLayout];

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={`${categoryName} — สินค้าดีลพิเศษ | ${siteName}`}
        description={`รวมสินค้า ${categoryName} ลดราคา โปรโมชั่นสุดคุ้ม จากร้านค้าชั้นนำ ราคาถูก ส่วนลดพิเศษ อัปเดตทุกวัน`}
        breadcrumbs={[
          { name: "หน้าแรก", url: "/" },
          { name: categoryName, url: `/category/${encodeURIComponent(categoryName)}` },
        ]}
      />
      <Header />

      <main className="container mx-auto px-4 py-6 space-y-5">
        {/* Breadcrumb */}
        <nav aria-label="breadcrumb" className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-foreground transition-colors flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" />
            หน้าแรก
          </Link>
          <span>/</span>
          <span className="text-foreground font-medium">{categoryName}</span>
        </nav>

        <div className="rounded-2xl bg-gradient-to-r from-primary to-accent px-6 py-6 animate-fade-in relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(255,255,255,0.12),transparent_60%)]" />
          <div className="relative flex items-center gap-3 mb-3">
            <Tag className="h-6 w-6 text-primary-foreground" />
            <h1 className="text-2xl font-bold text-primary-foreground">{categoryName}</h1>
          </div>
          <div className="relative">
            <SearchBar onSearch={handleSearch} initialValue={keyword} />
          </div>
        </div>

        {/* Other categories */}
        <nav aria-label="หมวดหมู่อื่นๆ" className="flex flex-wrap gap-2">
          {settings.categories
            .filter((c) => c !== categoryName)
            .map((cat) => (
              <Link key={cat} to={`/category/${encodeURIComponent(cat)}`}>
                <Badge variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors">
                  {cat}
                </Badge>
              </Link>
            ))}
        </nav>

        <FilterBar
          onPriceRange={(min, max) => { setPriceMin(min); setPriceMax(max); }}
          onSort={setSort}
          sort={sort}
        />

        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            {keyword ? `ผลการค้นหา "${keyword}" ใน ${categoryName}` : `สินค้าใน ${categoryName}`}
          </h2>
          <div className="flex items-center gap-2">
            {data && (
              <span className="text-sm text-muted-foreground">{filteredProducts.length} รายการ</span>
            )}
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 h-8 text-xs"
              onClick={cycleLayout}
              title="เปลี่ยน Layout"
            >
              {layoutIcon}
              Layout
            </Button>
          </div>
        </div>

        <MultiLayoutGrid
          products={filteredProducts}
          isLoading={isLoading}
          layout={activeLayout}
          sectionId={categoryName}
        />

        {data && (
          <PaginationBar
            currentPage={page}
            totalItems={data.meta.total}
            itemsPerPage={20}
            onPageChange={setPage}
          />
        )}
      </main>

      <Footer />
    </div>
  );
}
