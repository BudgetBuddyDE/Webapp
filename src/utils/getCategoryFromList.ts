import { Category } from '../models/category.model';

export function getCategoryFromList(categoryId: number, categories: Category[]): { label: string; value: number } {
  const match = categories.find((category) => category.id === categoryId);
  if (!match) {
    const { id, name } = categories[0]; // Fallback
    return {
      label: name,
      value: id,
    };
  } else return { label: match?.name, value: match.id };
}
