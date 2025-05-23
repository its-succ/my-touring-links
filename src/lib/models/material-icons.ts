export interface IconMetadata {
  host: string;
  asset_url_pattern: string;
  families: string[];
  icons: IconElement[];
}

export interface IconElement {
  name: string;
  version: number;
  popularity: number;
  codepoint: number;
  unsupported_families: string[];
  categories: string[];
  tags: string[];
  sizes_px: number[];
}

/**
 * アイコンをオートコンプリートする
 * @param icons - 全体アイコン一覧
 * @param searchText - 検索文字列
 * @returns オートコンプリートされたアイコン一覧
 */
export const filterIcons = (icons: IconElement[], searchText: string) => {
  if (icons === undefined) return [];
  const lower = searchText.toLowerCase();
  return icons.filter((icon: IconElement) => {
    if (icon.name.toLowerCase().includes(lower)) {
      return true;
    } else if (icon.tags.length) {
      return icon.tags.find((tag) => tag.toLowerCase().includes(lower)) !== undefined;
    }
    return false;
  });
};
