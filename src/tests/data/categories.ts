import { faker } from '@faker-js/faker';
import { Category } from '../../models/category.model';
import type { uuid } from '../../types/profile.type';
import { generateRandomId } from '../generateRandomId';

export function generateCategories(amount = 6, date = new Date()): Category[] {
  const CATEGORY_NAMES = faker.helpers.uniqueArray(faker.commerce.department, amount);
  return CATEGORY_NAMES.map((name) => {
    const inserted_at = faker.date.recent();
    return new Category({
      id: generateRandomId(),
      name: name,
      description: null,
      created_by: '' as uuid,
      updated_at: faker.date.between(inserted_at, date).toString(),
      inserted_at: inserted_at.toString(),
    });
  });
}
