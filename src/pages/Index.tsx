import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { SEOHead } from "@/components/SEOHead";
import { SearchBar } from "@/components/SearchBar";
import { KeywordTags } from "@/components/KeywordTags";
import { ProductGrid } from "@/components/ProductGrid";
import { MultiLayoutGrid, getLayoutForSection } from "@/components/ProductGridLayouts";
import { FilterBar, type SortOption } from "@/components/FilterBar";
import { PaginationBar } from "@/components/PaginationBar";
import { CompareTable } from "@/components/CompareTable";
import { PriceAlertBanner } from "@/components/PriceAlertBanner";
import { RecentlyViewed } from "@/components/RecentlyViewed";
import { FakePurchasePopup } from "@/components/FakePurchasePopup";
import { Footer } from "@/components/Footer";
import { useProducts } from "@/hooks/useProducts";
import { getAdminSettings } from "@/lib/store";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Tag, ChevronRight } from "lucide-react";

const CATEGORY_DISPLAY_LIMIT = 20;

const Index = () => {
  const settings = getAdminSettings();
  const [keyword, setKeyword] = useState("");
  const [activeTag, setActiveTag] = useState("");
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<SortOption>("default");
  const [priceMin, setPriceMin] = useState<number | undefined>();
  const [priceMax, setPriceMax] = useState<number | undefined>();

  const activeKeyword = keyword || activeTag;
  const { data, isLoading } = useProducts(activeKeyword, undefined, page);

  const handleSearch = (kw: string) => {
    setKeyword(kw);
    setActiveTag("");
    setPage(1);
  };

  const handleTagSelect = (kw: string) => {
    setActiveTag(kw);
    setKeyword("");
    setPage(1);
  };

  const handlePriceRange = (min: number | undefined, max: number | undefined) => {
    setPriceMin(min);
    setPriceMax(max);
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

  // Group products by category — show up to 20 per category
  const categoryGroups = useMemo(() => {
    if (!filteredProducts.length || activeKeyword) return [];
    const groups: Record<string, typeof filteredProducts> = {};
    for (const p of filteredProducts) {
      const cat = p.category_name || "อื่นๆ";
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(p);
    }
    return Object.entries(groups);
  }, [filteredProducts, activeKeyword]);

  const siteName = settings.siteName || "ThaiDeals";

  return (
    <div className="min-h-screen bg-background">
      <PriceAlertBanner />
      <SEOHead
        title={`${siteName} — รวมสินค้าดีลพิเศษ ลดราคา โปรโมชั่นสุดคุ้ม`}
        description={`${siteName} รวมสินค้าลดราคา โปรโมชั่นสุดคุ้ม จากร้านค้าชั้นนำ ค้นหาสินค้าราคาถูก ดีลเด็ด ส่วนลดพิเศษ อัปเดตทุกวัน`}
        type="website"
      />
      <Header />

      <main className="container mx-auto px-4 py-6 space-y-5">
        {/* Recently Viewed */}
        <RecentlyViewed />

        {/* Hero section */}
        <div className="rounded-2xl bg-gradient-to-r from-primary to-accent px-6 py-8 text-center animate-fade-in relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.15),transparent_60%)]" />
          <h1 className="text-2xl font-bold text-primary-foreground sm:text-3xl relative">
            🛒 {siteName} — สินค้าดีลพิเศษ
          </h1>
          <p className="mt-2 text-sm text-primary-foreground/80 relative">
            รวมสินค้าลดราคา โปรโมชั่นสุดคุ้ม จากร้านค้าชั้นนำ อัปเดตทุกวัน
          </p>
          <div className="mt-5 flex justify-center relative">
            <SearchBar onSearch={handleSearch} initialValue={keyword} />
          </div>
        </div>

        <KeywordTags
          keywords={settings.keywords}
          onSelect={handleTagSelect}
          active={activeTag}
        />

        {/* Category navigation */}
        {settings.categories.length > 0 && (
          <nav aria-label="หมวดหมู่สินค้า" className="space-y-2">
            <h2 className="text-sm font-semibold text-muted-foreground flex items-center gap-1.5">
              <Tag className="h-4 w-4" />
              หมวดหมู่
            </h2>
            <div className="flex flex-wrap gap-2">
              {settings.categories.map((cat) => (
                <Link key={cat} to={`/category/${encodeURIComponent(cat)}`}>
                  <Badge
                    variant="outline"
                    className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                  >
                    {cat}
                  </Badge>
                </Link>
              ))}
            </div>
          </nav>
        )}

        <FilterBar onPriceRange={handlePriceRange} onSort={setSort} sort={sort} />

        {/* Show by category when not searching — 20 items per category with varied layouts */}
        {!activeKeyword && categoryGroups.length > 0 ? (
          <div className="space-y-10">
            {categoryGroups.map(([catName, products]) => {
              const layout = getLayoutForSection(catName);
              const displayProducts = products.slice(0, CATEGORY_DISPLAY_LIMIT);
              return (
                <section key={catName} aria-labelledby={`cat-${catName}`} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2
                      id={`cat-${catName}`}
                      className="text-lg font-bold flex items-center gap-2"
                    >
                      <Tag className="h-4 w-4 text-primary" />
                      {catName}
                      <span className="text-sm font-normal text-muted-foreground">
                        ({products.length} รายการ)
                      </span>
                    </h2>
                    <Link
                      to={`/category/${encodeURIComponent(catName)}`}
                      className="text-sm text-primary hover:underline flex items-center gap-1"
                    >
                      ดูทั้งหมด
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                  <MultiLayoutGrid
                    products={displayProducts}
                    isLoading={false}
                    layout={layout}
                    sectionId={catName}
                  />
                </section>
              );
            })}
          </div>
        ) : !activeKeyword && isLoading ? (
          <div className="space-y-10">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-4">
                <div className="h-7 w-48 rounded bg-muted animate-pulse" />
                <MultiLayoutGrid isLoading={true} sectionId={`loading-${i}`} />
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* Tabs: Grid vs Compare */}
            <Tabs defaultValue="grid">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">
                  {activeKeyword ? `ผลการค้นหา "${activeKeyword}"` : "สินค้าแนะนำ"}
                </h2>
                <div className="flex items-center gap-3">
                  {data && (
                    <span className="text-sm text-muted-foreground">
                      {filteredProducts.length} รายการ
                    </span>
                  )}
                  <TabsList className="h-9">
                    <TabsTrigger value="grid" className="text-xs">แสดงสินค้า</TabsTrigger>
                    <TabsTrigger value="compare" className="text-xs">เปรียบเทียบ</TabsTrigger>
                  </TabsList>
                </div>
              </div>

              <TabsContent value="grid">
                <ProductGrid products={filteredProducts} isLoading={isLoading} />
              </TabsContent>
              <TabsContent value="compare">
                {filteredProducts.length > 0 ? (
                  <CompareTable products={filteredProducts} />
                ) : (
                  <p className="text-center py-10 text-muted-foreground">ไม่มีสินค้าให้เปรียบเทียบ</p>
                )}
              </TabsContent>
            </Tabs>

            {data && (
              <PaginationBar
                currentPage={page}
                totalItems={data.meta.total}
                itemsPerPage={20}
                onPageChange={setPage}
              />
            )}
          </>
        )}
      </main>

      <Footer />

      {/* Fake Purchase Popup */}
      <FakePurchasePopup products={filteredProducts} />
    </div>
  );
};

export default Index;
