import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SEOHead } from "@/components/SEOHead";
import { getAdminSettings } from "@/lib/store";
import { Info, Shield, Star, Users } from "lucide-react";

export default function AboutPage() {
  const settings = getAdminSettings();
  const siteName = settings.siteName || "ThaiDeals";

  return (
    <div className="min-h-screen bg-background">
      <SEOHead title={`เกี่ยวกับเรา | ${siteName}`} description={`ทำความรู้จักกับ ${siteName} แหล่งรวมดีลสินค้าที่ดีที่สุด`} />
      <Header />
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="text-center space-y-4 mb-12">
          <h1 className="text-4xl font-bold text-foreground">เกี่ยวกับเรา</h1>
          <p className="text-muted-foreground text-lg">เราคือผู้นำด้านการรวบรวมดีลและโปรโมชั่นสินค้าออนไลน์</p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 mb-16">
          <div className="bg-card p-8 rounded-2xl border shadow-sm space-y-4">
            <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
              <Shield className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-bold">ความน่าเชื่อถือ</h2>
            <p className="text-muted-foreground">เราคัดสรรเฉพาะสินค้าจากร้านค้าที่เป็นทางการและได้รับความนิยม เพื่อให้คุณมั่นใจในคุณภาพสินค้าทุกชิ้น</p>
          </div>
          <div className="bg-card p-8 rounded-2xl border shadow-sm space-y-4">
            <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
              <Star className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-bold">ดีลที่ดีที่สุด</h2>
            <p className="text-muted-foreground">ทีมงานของเราอัปเดตข้อมูลราคาและส่วนลดทุกวัน เพื่อให้คุณได้รับข้อเสนอที่คุ้มค่าที่สุดในตลาด</p>
          </div>
        </div>

        <div className="prose prose-slate max-w-none dark:prose-invert">
          <h2 className="text-2xl font-bold mb-4">วิสัยทัศน์ของเรา</h2>
          <p className="text-muted-foreground leading-relaxed mb-6">
            {siteName} ก่อตั้งขึ้นด้วยความตั้งใจที่จะช่วยให้ผู้บริโภคชาวไทยสามารถเข้าถึงสินค้าคุณภาพในราคาที่ประหยัดที่สุด 
            เราเชื่อว่าการช้อปปิ้งออนไลน์ควรเป็นเรื่องง่าย สนุก และคุ้มค่า เราจึงสร้างแพลตฟอร์มนี้ขึ้นมาเพื่อเป็นตัวกลางในการค้นหาและเปรียบเทียบดีลที่ดีที่สุดจากทุกร้านค้าชั้นนำ
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
