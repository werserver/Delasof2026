import { useEffect } from "react";
import { getAdminSettings, type ThemeColor } from "@/lib/store";

// Theme color palettes: [primary H S L, accent H S L]
const THEME_PALETTES: Record<ThemeColor, { primary: string; accent: string; ring: string }> = {
  orange: {
    primary: "16 85% 55%",
    accent: "40 90% 55%",
    ring: "16 85% 55%",
  },
  blue: {
    primary: "217 91% 55%",
    accent: "199 89% 48%",
    ring: "217 91% 55%",
  },
  green: {
    primary: "142 71% 45%",
    accent: "158 64% 52%",
    ring: "142 71% 45%",
  },
  purple: {
    primary: "262 83% 58%",
    accent: "280 87% 65%",
    ring: "262 83% 58%",
  },
  red: {
    primary: "0 84% 55%",
    accent: "14 90% 55%",
    ring: "0 84% 55%",
  },
  teal: {
    primary: "174 72% 40%",
    accent: "185 84% 45%",
    ring: "174 72% 40%",
  },
  pink: {
    primary: "330 81% 60%",
    accent: "350 89% 65%",
    ring: "330 81% 60%",
  },
  indigo: {
    primary: "239 84% 60%",
    accent: "255 80% 65%",
    ring: "239 84% 60%",
  },
};

export function applyThemeColor(color: ThemeColor) {
  const palette = THEME_PALETTES[color] || THEME_PALETTES.orange;
  const root = document.documentElement;
  root.style.setProperty("--primary", palette.primary);
  root.style.setProperty("--ring", palette.ring);
  root.style.setProperty("--accent", palette.accent);
  // Also update sidebar primary
  root.style.setProperty("--sidebar-primary", palette.primary);
  root.style.setProperty("--sidebar-ring", palette.ring);
}

export function ThemeColorProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const settings = getAdminSettings();
    applyThemeColor(settings.themeColor || "orange");
  }, []);

  return <>{children}</>;
}

export const THEME_OPTIONS: { value: ThemeColor; label: string; color: string }[] = [
  { value: "orange", label: "ส้ม (ค่าเริ่มต้น)", color: "#f97316" },
  { value: "blue", label: "น้ำเงิน", color: "#3b82f6" },
  { value: "green", label: "เขียว", color: "#22c55e" },
  { value: "purple", label: "ม่วง", color: "#a855f7" },
  { value: "red", label: "แดง", color: "#ef4444" },
  { value: "teal", label: "เขียวน้ำทะเล", color: "#14b8a6" },
  { value: "pink", label: "ชมพู", color: "#ec4899" },
  { value: "indigo", label: "คราม", color: "#6366f1" },
];
