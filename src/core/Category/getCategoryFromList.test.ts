import type { TCategory } from '@/types';
import { getCategoryFromList } from './getCategoryFromList.util';

// Sample categories for testing
const categories: TCategory[] = [
  { id: 1, name: 'Category 1' },
  { id: 2, name: 'Category 2' },
  { id: 3, name: 'Category 3' },
] as TCategory[];

describe('getCategoryFromList', () => {
  it('should return the correct category when found', () => {
    const categoryId = 2;
    const result = getCategoryFromList(categoryId, categories);

    // Check if the result has the expected value
    expect(result).toEqual({ label: 'Category 2', value: 2 });
  });

  it('should fallback to the first category if no match is found', () => {
    const categoryId = 99; // An invalid categoryId for the test case
    const result = getCategoryFromList(categoryId, categories);

    // Check if the result has the expected value (fallback to the first category)
    expect(result).toEqual({ label: 'Category 1', value: 1 });
  });
});
