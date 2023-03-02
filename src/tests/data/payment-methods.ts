import { faker } from '@faker-js/faker';
import { PaymentMethod } from '../../models';
import type { uuid } from '../../types';
import { generateRandomId } from '../generateRandomId';

export function generatePaymentMethods(amount = 3, date = new Date(), countryCode = 'DE'): PaymentMethod[] {
  const CARD_ISSUER = faker.helpers.uniqueArray(faker.finance.creditCardIssuer, amount);
  return CARD_ISSUER.map((provider) => {
    const inserted_at = faker.date.recent();
    return new PaymentMethod({
      id: generateRandomId(),
      name: faker.finance.accountName(),
      provider: provider,
      address: faker.finance.iban(true, countryCode),
      description: null,
      created_by: '' as uuid,
      updated_at: faker.date.between(inserted_at, date).toString(),
      inserted_at: inserted_at.toString(),
    });
  });
}

export const PaymentMethods: PaymentMethod[] = [
  new PaymentMethod({
    id: 1,
    name: 'Debit Card',
    provider: 'Visa',
    address: 'DE33500105179228347674',
    description: null,
    created_by: 'unit-test',
    updated_at: '01-01-2022',
    inserted_at: '01-01-2022',
  }),
  new PaymentMethod({
    id: 2,
    name: 'PayPal (unit@test.com)',
    provider: 'PayPal',
    address: 'unit@test.com',
    description: null,
    created_by: 'unit-test',
    updated_at: '01-01-2022',
    inserted_at: '01-01-2022',
  }),
];
