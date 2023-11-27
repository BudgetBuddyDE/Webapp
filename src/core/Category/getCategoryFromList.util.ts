import type { TCategory } from '@/types';

export function getCategoryFromList(
  categoryId: number,
  categories: TCategory[]
): { label: string; value: number } | undefined {
  const match = categories.find((category) => category.id === categoryId);
  if (!match) return undefined;
  return { label: match.name, value: match.id };
}
