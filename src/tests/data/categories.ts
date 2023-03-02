import { faker } from '@faker-js/faker';
import { Category } from '../../models';
import type { uuid } from '../../types';
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

export const Categories: Category[] = [
  new Category({
    id: 1,
    name: 'Rent',
    description: null,
    created_by: 'unit-test',
    updated_at: '01-01-2022',
    inserted_at: '01-01-2022',
  }),
  new Category({
    id: 2,
    name: 'Groceries',
    description: null,
    created_by: 'unit-test',
    updated_at: '01-01-2022',
    inserted_at: '01-01-2022',
  }),
  new Category({
    id: 3,
    name: 'Car',
    description: null,
    created_by: 'unit-test',
    updated_at: '01-01-2022',
    inserted_at: '01-01-2022',
  }),
  new Category({
    id: 4,
    name: 'Salary',
    description: null,
    created_by: 'unit-test',
    updated_at: '01-01-2022',
    inserted_at: '01-01-2022',
  }),
  new Category({
    id: 5,
    name: 'Subscriptions',
    description: 'Netflix, Disney+ etc.',
    created_by: 'unit-test',
    updated_at: '01-01-2022',
    inserted_at: '01-01-2022',
  }),
  new Category({
    id: 6,
    name: 'Unknown',
    description: null,
    created_by: 'unit-test',
    updated_at: '01-01-2022',
    inserted_at: '01-01-2022',
  }),
];
