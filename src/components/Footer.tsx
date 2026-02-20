import { Link } from "react-router-dom";
import { getAdminSettings } from "@/lib/store";
import { Home, Tag, Info, Mail } from "lucide-react";

export const Footer = () => {
  const settings = getAdminSettings();
  const siteName = settings.siteName || "ThaiDeals";

  return (
    <footer className="border-t bg-card mt-12">
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Site Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-foreground">{siteName}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              รวมสินค้าดีลพิเศษ ลดราคา โปรโมชั่นสุดคุ้ม จากร้านค้าชั้นนำ 
              อัปเดตทุกวันเพื่อให้คุณไม่พลาดทุกดีลเด็ด
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">เมนูหลัก</h3>
            <nav className="flex flex-col gap-2.5">
              <Link to="/" className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2">
                <Home className="h-4 w-4" />
                หน้าแรก
              </Link>
              <Link to="/#categories" className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2">
                <Tag className="h-4 w-4" />
                หมวดหมู่สินค้า
              </Link>
              <Link to="/about" className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2">
                <Info className="h-4 w-4" />
                เกี่ยวกับเรา
              </Link>
              <Link to="/contact" className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2">
                <Mail className="h-4 w-4" />
                ติดต่อเรา
              </Link>
            </nav>
          </div>

          {/* Categories */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">หมวดหมู่ยอดนิยม</h3>
            <div className="flex flex-wrap gap-2">
              {settings.categories.slice(0, 8).map((cat) => (
                <Link
                  key={cat}
                  to={`/category/${encodeURIComponent(cat)}`}
                  className="text-xs bg-secondary hover:bg-primary hover:text-primary-foreground px-3 py-1.5 rounded-full transition-colors"
                >
                  {cat}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t mt-10 pt-6 text-center">
          <p className="text-xs text-muted-foreground">
            © 2026 {siteName} — สินค้าดีลพิเศษ โปรโมชั่นสุดคุ้ม. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
