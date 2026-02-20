// Admin settings — stored in localStorage, with config.ts as defaults
import config from "@/lib/config";

const SETTINGS_KEY = "aff-shop-settings";
const CSV_DATA_KEY = "aff-shop-csv-data";

export type ThemeColor =
  | "orange"
  | "blue"
  | "green"
  | "purple"
  | "red"
  | "teal"
  | "pink"
  | "indigo";

export interface AdminSettings {
  dataSource: "api" | "csv";
  apiToken: string;
  categories: string[];
  keywords: string[];
  selectedAdvertisers: string[];
  enableFlashSale: boolean;
  enableAiReviews: boolean;
  enablePrefixWords: boolean;
  prefixWordsList: string[];
  defaultCurrency: string;
  csvFileName: string;
  cloakingBaseUrl: string;
  cloakingToken?: string;
  siteName: string;
  faviconUrl: string;
  themeColor: ThemeColor;
  /** Category CSV data: key = category name, value = CSV text */
  categoryCsvMap: Record<string, string>;
  /** Category CSV file names for display */
  categoryCsvFileNames: Record<string, string>;
}

function getDefaults(): AdminSettings {
  return {
    dataSource: config.dataSource,
    apiToken: "",
    categories: [...config.categories],
    keywords: [...config.keywords],
    selectedAdvertisers: [...config.selectedAdvertisers],
    enableFlashSale: config.enableFlashSale,
    enableAiReviews: config.enableAiReviews,
    enablePrefixWords: false,
    prefixWordsList: [
      "ถูกที่สุด",
      "ลดราคา",
      "ส่วนลดพิเศษ",
      "ขายดี",
      "แนะนำ",
      "คุ้มสุดๆ",
      "ราคาดี",
      "โปรโมชั่น",
      "สุดคุ้ม",
      "ห้ามพลาด",
      "ราคาถูก",
      "ดีลเด็ด",
      "ลดแรง",
      "ยอดนิยม",
      "ราคาพิเศษ",
    ],
    defaultCurrency: config.defaultCurrency,
    csvFileName: "",
    cloakingBaseUrl: "https://goeco.mobi/?token=QlpXZyCqMylKUjZiYchwB",
    cloakingToken: "QlpXZyCqMylKUjZiYchwB",
    siteName: "ThaiDeals",
    faviconUrl: "/favicon.ico",
    themeColor: "orange" as ThemeColor,
    categoryCsvMap: {},
    categoryCsvFileNames: {},
  };
}

export function getAdminSettings(): AdminSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) {
      const saved = JSON.parse(raw);
      const defaults = getDefaults();
      return {
        ...defaults,
        ...saved,
        prefixWordsList:
          saved.prefixWordsList && saved.prefixWordsList.length > 0
            ? saved.prefixWordsList
            : defaults.prefixWordsList,
      };
    }
  } catch {}
  return getDefaults();
}

export function saveAdminSettings(settings: AdminSettings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

// CSV data stored in localStorage
export function getCsvData(): string | null {
  try {
    return localStorage.getItem(CSV_DATA_KEY);
  } catch {
    return null;
  }
}

export function saveCsvData(csvText: string): void {
  localStorage.setItem(CSV_DATA_KEY, csvText);
}

export function clearCsvData(): void {
  localStorage.removeItem(CSV_DATA_KEY);
}
