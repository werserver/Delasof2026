// Persuasive prefix words to add before product names
// Words are now managed via Admin Panel settings

// Deterministic random based on product ID
function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) % 1000000;
  }
  return hash;
}

export function getPrefix(productId: string, prefixWords: string[]): string {
  if (!prefixWords || prefixWords.length === 0) return "";
  const idx = hashCode(productId) % prefixWords.length;
  return prefixWords[idx];
}

export function getPrefixedName(
  productId: string,
  name: string,
  prefixWords: string[]
): string {
  const prefix = getPrefix(productId, prefixWords);
  if (!prefix) return name;
  return `${prefix} ${name}`;
}
