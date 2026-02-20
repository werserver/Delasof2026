// Admin settings — stored in localStorage, with config.ts as defaults
import config from "@/lib/config";
import { loadConfigFromServer, saveConfigToServer, loadCsvFromServer, saveCsvToServer } from "@/lib/server-storage";

const SETTINGS_KEY = "aff-shop-settings";
const CSV_DATA_KEY = "aff-shop-csv-data";

// Server config cache
let serverConfig: AdminSettings | null = null;
let isLoadingServerConfig = false;

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
  // Return server config if loaded
  if (serverConfig) {
    return serverConfig;
  }

  // Fallback to localStorage
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

/**
 * Load config from server (async)
 */
export async function loadServerConfig(): Promise<AdminSettings> {
  if (isLoadingServerConfig) return getAdminSettings();
  if (serverConfig) return serverConfig;

  isLoadingServerConfig = true;
  try {
    const loaded = await loadConfigFromServer();
    if (loaded) {
      serverConfig = {
        ...getDefaults(),
        ...loaded,
      };
      // Also save to localStorage as backup
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(serverConfig));
      return serverConfig;
    }
  } catch (error) {
    console.error("Error loading server config:", error);
  } finally {
    isLoadingServerConfig = false;
  }

  return getAdminSettings();
}

export function saveAdminSettings(settings: AdminSettings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  serverConfig = settings;
}

/**
 * Save config to server (async)
 */
export async function saveServerConfig(settings: AdminSettings): Promise<boolean> {
  try {
    const success = await saveConfigToServer(settings);
    if (success) {
      serverConfig = settings;
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
      return true;
    }
  } catch (error) {
    console.error("Error saving server config:", error);
  }
  return false;
}

// CSV data stored in localStorage (fallback) and Server
export function getCsvData(): string | null {
  try {
    return localStorage.getItem(CSV_DATA_KEY);
  } catch {
    return null;
  }
}

/**
 * Load main CSV from server
 */
export async function loadMainCsvFromServer(): Promise<string | null> {
  const data = await loadCsvFromServer("__main__");
  if (data) {
    localStorage.setItem(CSV_DATA_KEY, data);
    return data;
  }
  return getCsvData();
}

export async function saveCsvData(csvText: string): Promise<void> {
  localStorage.setItem(CSV_DATA_KEY, csvText);
  await saveCsvToServer("__main__", csvText);
}

export function clearCsvData(): void {
  localStorage.removeItem(CSV_DATA_KEY);
}
