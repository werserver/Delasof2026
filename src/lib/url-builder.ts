/**
 * URL Builder Utilities
 * สำหรับสร้าง URL ที่มี cloaking และ tracking
 */

const DEFAULT_CLOAKING_BASE_URL = "https://goeco.mobi/?token=QlpXZyCqMylKUjZiYchwB";
const DEFAULT_CLOAKING_TOKEN = "QlpXZyCqMylKUjZiYchwB";

export const buildCloakedUrl = (
  token: string | undefined,
  productUrl: string,
  customBaseUrl?: string
): string => {
  if (!productUrl) return "";

  // Use custom base URL if provided
  const baseUrl = customBaseUrl || DEFAULT_CLOAKING_BASE_URL;
  const activeToken = token || DEFAULT_CLOAKING_TOKEN;

  if (baseUrl && baseUrl.includes('?token=')) {
    const encodedUrl = encodeURIComponent(productUrl);
    const base = baseUrl.split('&url=')[0];
    return `${base}&url=${encodedUrl}&source=api_product`;
  }

  if (activeToken) {
    const encodedUrl = encodeURIComponent(productUrl);
    return `https://goeco.mobi/?token=${activeToken}&url=${encodedUrl}&source=api_product`;
  }

  return productUrl;
};

export { DEFAULT_CLOAKING_BASE_URL, DEFAULT_CLOAKING_TOKEN };
