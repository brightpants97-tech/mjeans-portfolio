export const WORK_CATEGORIES = ['일상', '합방', '여행', '게임', 'AI', '썸네일'] as const;
export type WorkCategory = typeof WORK_CATEGORIES[number];
export const MAX_THUMBNAIL_BYTES = 4 * 1024 * 1024;

export function isWorkCategory(value: unknown): value is WorkCategory {
  return WORK_CATEGORIES.some((category) => category === value);
}
