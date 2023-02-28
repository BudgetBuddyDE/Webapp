import { faker } from '@faker-js/faker';
import { PaymentMethod } from '../../models/paymentMethod.model';
import type { uuid } from '../../types/profile.type';
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
