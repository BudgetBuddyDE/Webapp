import type { ICategory } from '../types/transaction.interface';

export function getCategoryFromList(
  categoryId: number,
  categories: ICategory[]
): { label: string; value: number } {
  const match = categories.find((category) => category.id === categoryId);
  if (!match) {
    const { id, name } = categories[0]; // Fallback
    return {
      label: name,
      value: id,
    };
  } else return { label: match?.name, value: match.id };
}
